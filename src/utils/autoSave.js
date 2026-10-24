const PREFERENCE_KEY = 'covergen-autosave-enabled-v1';
const DRAFT_KEY = 'covergen-autosave-draft-v1';
const DATABASE_NAME = 'covergen-local-data';
const DATABASE_VERSION = 1;
const ASSET_STORE = 'assets';

let databasePromise;

export function readAutoSavePreference() {
  try {
    const savedValue = window.localStorage.getItem(PREFERENCE_KEY);
    return {
      enabled: savedValue === null ? true : savedValue === 'true',
      error: false,
    };
  } catch {
    return { enabled: true, error: true };
  }
}

export function writeAutoSavePreference(enabled) {
  window.localStorage.setItem(PREFERENCE_KEY, String(enabled));
}

function openDatabase() {
  if (databasePromise) return databasePromise;

  databasePromise = new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('This browser does not support local file storage.'));
      return;
    }

    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(ASSET_STORE)) {
        database.createObjectStore(ASSET_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open local file storage.'));
    request.onblocked = () => reject(new Error('Local file storage is busy. Please reload and try again.'));
  }).catch((error) => {
    databasePromise = undefined;
    throw error;
  });

  return databasePromise;
}

async function writeAsset(id, asset) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(ASSET_STORE, 'readwrite');
    transaction.objectStore(ASSET_STORE).put(asset, id);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error('Could not save an uploaded file.'));
    transaction.onabort = () => reject(transaction.error || new Error('Saving an uploaded file was interrupted.'));
  });
}

async function readAsset(id) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(ASSET_STORE, 'readonly');
    const request = transaction.objectStore(ASSET_STORE).get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error('Could not read a saved file.'));
    transaction.onabort = () => reject(transaction.error || new Error('Reading a saved file was interrupted.'));
  });
}

async function removeAssets(ids) {
  const assetIds = [...new Set(ids.filter(Boolean))];
  if (!assetIds.length) return;

  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(ASSET_STORE, 'readwrite');
    const store = transaction.objectStore(ASSET_STORE);
    assetIds.forEach((id) => store.delete(id));
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error('Could not clear saved files.'));
    transaction.onabort = () => reject(transaction.error || new Error('Clearing saved files was interrupted.'));
  });
}

function makeAssetId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function assetMetadata(file, fallbackName) {
  return {
    name: file.name || fallbackName,
    type: file.type || 'application/octet-stream',
    lastModified: file.lastModified || 0,
  };
}

export async function restoreAutoSaveDraft(fallbackFormData) {
  const rawDraft = window.localStorage.getItem(DRAFT_KEY);
  if (!rawDraft) {
    return {
      formData: fallbackFormData,
      assetCache: { logo: null, font: null },
      hasSavedDraft: false,
      warning: '',
    };
  }

  const record = JSON.parse(rawDraft);
  if (!record || record.version !== 1 || !record.formData || typeof record.formData !== 'object') {
    throw new Error('The saved document data could not be read. Your fields were left unchanged.');
  }

  const savedFormData = record.formData;
  const restoredFormData = {
    ...fallbackFormData,
    ...savedFormData,
    universityLogo: null,
    universityLogoPreview: '',
    customFontUrl: '',
  };
  if (!Array.isArray(savedFormData.students) || savedFormData.students.length === 0) {
    restoredFormData.students = fallbackFormData.students;
  }

  const assetCache = { logo: null, font: null };
  const warnings = [];

  if (record.assets?.logo) {
    try {
      const asset = await readAsset(record.assets.logo);
      if (!asset?.blob) throw new Error('The saved university logo was not found.');
      const file = new File([asset.blob], asset.name || 'university-logo', {
        type: asset.type || asset.blob.type || 'image/png',
        lastModified: asset.lastModified || 0,
      });
      const previewUrl = URL.createObjectURL(file);
      restoredFormData.universityLogo = file;
      restoredFormData.universityLogoPreview = previewUrl;
      assetCache.logo = { id: record.assets.logo, source: file };
    } catch {
      warnings.push('The saved university logo could not be restored.');
    }
  }

  if (record.assets?.font) {
    try {
      const asset = await readAsset(record.assets.font);
      if (!asset?.blob) throw new Error('The saved font was not found.');
      const fontUrl = URL.createObjectURL(asset.blob);
      restoredFormData.customFontUrl = fontUrl;
      assetCache.font = { id: record.assets.font, source: fontUrl };
    } catch {
      warnings.push('The saved custom font could not be restored.');
    }
  }

  return {
    formData: restoredFormData,
    assetCache,
    hasSavedDraft: true,
    warning: warnings.join(' '),
  };
}

export async function saveAutoSaveDraft(formData, previousAssetCache) {
  const createdAssetIds = [];
  const nextAssetCache = { logo: null, font: null };

  try {
    let logoId = null;
    if (formData.universityLogo) {
      const source = formData.universityLogo;
      if (previousAssetCache?.logo?.source === source) {
        logoId = previousAssetCache.logo.id;
      } else {
        logoId = makeAssetId();
        await writeAsset(logoId, { blob: source, ...assetMetadata(source, 'university-logo') });
        createdAssetIds.push(logoId);
      }
      nextAssetCache.logo = { id: logoId, source };
    }

    let fontId = null;
    if (formData.customFontUrl) {
      const source = formData.customFontUrl;
      if (previousAssetCache?.font?.source === source) {
        fontId = previousAssetCache.font.id;
      } else {
        const response = await fetch(source);
        if (!response.ok) throw new Error('Could not read the uploaded custom font.');
        const blob = await response.blob();
        fontId = makeAssetId();
        await writeAsset(fontId, {
          blob,
          name: formData.customFontName || 'custom-font',
          type: blob.type || 'application/octet-stream',
          lastModified: 0,
        });
        createdAssetIds.push(fontId);
      }
      nextAssetCache.font = { id: fontId, source };
    }

    const excludedKeys = new Set(['universityLogo', 'universityLogoPreview', 'customFontUrl']);
    const serializableFormData = Object.fromEntries(
      Object.entries(formData).filter(([key]) => !excludedKeys.has(key))
    );
    const nextRecord = {
      version: 1,
      savedAt: new Date().toISOString(),
      formData: serializableFormData,
      assets: { logo: logoId, font: fontId },
    };

    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(nextRecord));

    const oldAssetIds = [previousAssetCache?.logo?.id, previousAssetCache?.font?.id];
    const currentAssetIds = [logoId, fontId];
    try {
      await removeAssets(oldAssetIds.filter((id) => !currentAssetIds.includes(id)));
    } catch {
      // The new draft is already committed; an orphaned older asset is harmless.
    }

    return nextAssetCache;
  } catch (error) {
    try {
      await removeAssets(createdAssetIds);
    } catch {
      // Keep the original save error as the useful status message.
    }
    throw error;
  }
}

export async function clearAutoSaveDraft() {
  let record;
  try {
    const rawDraft = window.localStorage.getItem(DRAFT_KEY);
    try {
      record = rawDraft ? JSON.parse(rawDraft) : null;
    } catch {
      record = null;
    }
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    throw new Error('The saved document could not be cleared. Please try again.');
  }

  try {
    await removeAssets([record?.assets?.logo, record?.assets?.font]);
  } catch {
    // Removing the localStorage record prevents old form data from being restored.
  }
}
