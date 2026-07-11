export type ShareStatus = 'shared' | 'copied' | 'cancelled' | 'manual' | 'failed';

export type ShareResult = {
  status: ShareStatus;
  method?: 'web-share' | 'clipboard' | 'manual';
};

const copyWithLegacySelection = (value: string): boolean => {
  if (typeof document === 'undefined') {
    return false;
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
};

export const shareOrCopy = async (payload: ShareData): Promise<ShareResult> => {
  if (typeof navigator === 'undefined') {
    return { status: 'failed' };
  }

  if (typeof navigator.share === 'function') {
    try {
      await navigator.share(payload);
      return { status: 'shared', method: 'web-share' };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { status: 'cancelled' };
      }
    }
  }

  const valueToCopy = payload.url || payload.text || payload.title || '';
  if (!valueToCopy) {
    return { status: 'failed' };
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(valueToCopy);
      return { status: 'copied', method: 'clipboard' };
    }
  } catch {
    // Fall through to the selection-based copy fallback.
  }

  if (copyWithLegacySelection(valueToCopy)) {
    return { status: 'copied', method: 'clipboard' };
  }

  if (typeof window !== 'undefined' && typeof window.prompt === 'function') {
    window.prompt('아래 공유 링크를 복사해 주세요.', valueToCopy);
    return { status: 'manual', method: 'manual' };
  }

  return { status: 'failed' };
};
