export const saveLocal = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value)); // 👈 JSON.stringify 로 수정!
    // 같은 탭의 마이페이지도 장바구니·찜 목록 변경을 즉시 반영합니다.
    window.dispatchEvent(new CustomEvent('shopping-storage-changed', { detail: { key } }));
  } catch (error) {
    console.error('LocalStorage 저장 실패:', error);
  }
};

export const loadLocal = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.error('LocalStorage 불러오기 실패:', error);
    return defaultValue;
  }
};
