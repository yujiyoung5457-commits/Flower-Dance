# 쇼핑몰 프로젝트 구조 및 동작 설명

이 문서는 현재 실제 코드가 작성되어 있는 파일만 설명합니다. 빈 컴포넌트, 내용이 없는 API·store·hook 파일, `node_modules`, `dist`, 이미지 원본은 제외했습니다.

## 전체 화면 흐름

```text
main.jsx
└─ App.jsx
   ├─ Header.jsx
   │  └─ SearchBox.jsx
   ├─ Routes (주소에 따라 페이지 선택)
   │  ├─ Home.jsx
   │  │  ├─ MainBanner.jsx
   │  │  ├─ CategoryMenu.jsx
   │  │  └─ ProductList.jsx → ProductCard.jsx
   │  ├─ Products.jsx
   │  │  ├─ ProductFilter.jsx
   │  │  ├─ ProductSort.jsx
   │  │  └─ ProductList.jsx → ProductCard.jsx
   │  ├─ ProductDetail.jsx
   │  │  └─ QuantityControl.jsx
   │  ├─ SearchResult.jsx
   │  │  └─ ProductList.jsx → ProductCard.jsx
   │  └─ Cart.jsx
   └─ Footer.jsx
```

## 실행 시작점

### `src/main.jsx`

React 앱을 HTML의 `#root` 요소에 연결합니다. 이 파일에서 `App`을 렌더링하므로, 모든 화면은 여기서 시작합니다.

### `src/App.jsx`

공통 `Header`, `Footer`를 항상 표시하고, 주소별 페이지를 연결합니다.

| 주소 | 연결 페이지 | 역할 |
| --- | --- | --- |
| `/` | `Home.jsx` | 메인 배너, 카테고리, 추천 상품 |
| `/products` | `Products.jsx` | 전체 상품 목록 |
| `/products/category/:category` | `Products.jsx` | 카테고리별 상품 목록 |
| `/products/:id` | `ProductDetail.jsx` | 상품 상세 화면 |
| `/search/:keyword` | `SearchResult.jsx` | 검색 결과 |
| `/cart` | `Cart.jsx` | 장바구니 |
| `/login`, `/signup`, `/wishlist` | 각 페이지 컴포넌트 | 현재 기본 화면/확장 예정 |

## 상품 데이터와 이미지

### `public/data/products-fixed.json`

현재 앱에서 실제로 사용하는 상품 데이터입니다. 홈, 상품 목록, 상세, 검색 화면이 모두 이 파일을 `fetch('/data/products-fixed.json')`로 읽습니다.

상품 한 개는 아래 형태입니다.

```json
{
  "id": 7,
  "name": "상품명",
  "category": "화면에 표시할 카테고리명",
  "categoryValue": "URL/필터에 사용할 영문값",
  "price": 59000,
  "discountRate": 15,
  "image": "/img/pd-06.png"
}
```

- `id`: 상세 주소와 연결됩니다. 카드에서 `/products/7`로 이동하면 상세가 `id: 7`을 찾습니다.
- `name`, `category`, `image`: 카드와 상세 화면에 표시됩니다.
- `categoryValue`: `/products/category/값`에서 카테고리 필터 기준이 됩니다.
- `price`, `discountRate`: 할인 가격과 총 상품 금액을 계산합니다.

### `public/data/categories-fixed.json`

카테고리 메뉴 및 필터가 읽는 데이터입니다. `name`, `path`, `image`를 이용해 카테고리 링크를 만듭니다.

### `public/data/banners.json`

메인 배너 슬라이드 데이터입니다. 배너 이미지, 제목, 설명을 담습니다.

### `public/img/`

상품 이미지와 로고 같은 정적 파일 폴더입니다. 상품 데이터의 `image` 값은 이 폴더를 기준으로 `/img/파일명.png` 형식으로 작성합니다.

## 공통 컴포넌트

### `src/components/Header.jsx`

로고, `SearchBox`, 로그인/회원가입/위시리스트/카트 링크, 카테고리 메뉴를 표시합니다. 모든 페이지의 상단에 공통으로 렌더링됩니다.

### `src/components/SearchBox.jsx`

검색어를 state로 관리합니다. 폼 제출 시 공백을 제거하고 `/search/검색어`로 이동합니다. `SearchResult.jsx`가 주소의 검색어를 받아 실제 필터링을 수행합니다.

### `src/components/Footer.jsx`

모든 페이지의 하단에 표시되는 푸터입니다.

### `src/components/MainBanner.jsx`

`banners.json`을 읽어 첫 배너를 표시합니다.

- `banners`: 불러온 배너 배열
- `currentIndex`: 현재 화면에 보이는 배너 번호
- 자동 전환: 배너가 있을 때 4초마다 다음 배너로 이동
- `onprev`, `onnext`: 이전/다음 버튼 동작
- 점 버튼: 특정 배너로 즉시 이동

### `src/components/CategoryMenu.jsx`

`categories-fixed.json`을 읽어 메인 화면의 카테고리 목록을 만듭니다. 각 항목은 `item.path`로 연결되어 해당 카테고리 상품 목록으로 이동합니다.

## 상품 목록 관련 컴포넌트

### `src/components/ProductList.jsx`

`products` 배열을 받아 상품마다 `ProductCard`를 렌더링합니다.

```text
products 배열
  └─ map()
      └─ ProductCard 1개씩 생성
```

상품이 없으면 `등록된 상품이 없습니다.`를 표시합니다. 목록의 카드 간격, 줄바꿈, 전체 정렬은 `ProductList.module.scss`의 `.root`에서 조절합니다.

### `src/components/ProductCard.jsx`

상품 카드 한 장을 그립니다.

- 상품 이미지와 이름 클릭 → `/products/:id` 상세 페이지 이동
- 할인 가격 계산 → `price - (price × discountRate / 100)`
- 하트 버튼 → 카드 내부 `isLike` state만 변경하여 `♡`/`♥` 표시

현재 하트 상태는 카드에만 저장되며, 위시리스트 페이지나 localStorage에는 아직 연결되어 있지 않습니다.

### `src/components/ProductFilter.jsx`

카테고리 링크와 가격대 select를 표시합니다.

- 부모 `Products.jsx`에서 받은 `priceRange`, `setPriceRange`로 가격 조건을 변경합니다.
- `getClass()`는 현재 선택한 카테고리에 `active` 클래스를 추가합니다.

### `src/components/ProductSort.jsx`

정렬 select를 표시합니다. `latest`, `low`, `high` 값을 부모 `Products.jsx`의 `sortType` state로 전달합니다.

## 페이지별 동작

### `src/pages/Home.jsx`

메인 화면입니다.

1. `products-fixed.json`을 불러옵니다.
2. `slice(0, 4)`로 앞의 4개만 추천 상품으로 고릅니다.
3. `MainBanner`, `CategoryMenu`, `ProductList`를 순서대로 표시합니다.

### `src/pages/Products.jsx`

전체/카테고리 상품 목록 화면입니다.

```text
상품 데이터
  → URL 카테고리 필터(categoryValue 비교)
  → 가격대 필터(할인가 기준)
  → 정렬(최신/낮은 가격/높은 가격)
  → ProductList에 전달
```

핵심 state는 아래와 같습니다.

- `product`: 전체 상품 배열
- `priceRange`: 선택한 가격대
- `sortType`: 선택한 정렬 방식
- `category`: URL의 `:category` 값

### `src/pages/ProductDetail.jsx`

상품 상세 화면입니다.

1. URL의 `id`를 `useParams()`로 읽습니다.
2. `products-fixed.json`에서 동일한 `id`의 상품을 찾습니다.
3. 할인가와 수량을 곱해 총 상품 금액을 계산합니다.
4. `QuantityControl`로 수량을 바꿉니다.
5. 장바구니 버튼을 누르면 브라우저 `localStorage`의 `cart` 배열에 상품을 추가하거나 기존 수량을 증가시킵니다.

주요 state:

- `product`: 현재 보고 있는 상품
- `isLoading`: 데이터 로딩 상태
- `quantity`: 선택 수량
- `isLike`: 상세 화면의 찜 버튼 표시 상태

상세 레이아웃은 `ProductDetail.module.scss`에서 조절합니다. 특히 `.section`은 이미지와 상품 정보의 2열 배치, `.imgBox`는 상품 이미지 크기, `.impoBox`는 오른쪽 정보 영역입니다.

### `src/components/QuantityControl.jsx`

`-`와 `+` 버튼으로 수량을 조절합니다.

- 수량은 1보다 낮아지지 않습니다.
- `maxQuantity`가 전달된 경우 재고보다 커지지 않습니다.
- 실제 수량 state는 부모 `ProductDetail.jsx`가 가지고 있으며, 이 컴포넌트는 `quantity`, `setQuantity`를 props로 받습니다.

### `src/pages/SearchResult.jsx`

주소의 `keyword`를 받아 상품명 또는 카테고리에 검색어가 포함된 상품만 골라 `ProductList`에 전달합니다.

### `src/pages/Cart.jsx`

장바구니 화면을 만들기 위한 코드가 작성되어 있습니다.

- `localStorage`의 `cart`를 읽고, 장바구니 배열 변경 시 다시 저장하려는 구조입니다.
- 전체 삭제, 수량 변경, 개별 삭제, 배송비·합계 계산을 위한 함수가 있습니다.

현재 `CartItem`, `OrderSummary`의 실제 구현과 일부 변수/함수 이름 정리가 더 필요하므로, 상세 페이지의 `장바구니 담기`와 완전히 연결된 상태는 아닙니다.

## 스타일 파일 위치

각 JSX 파일의 바로 옆 `.module.scss` 파일이 해당 컴포넌트 전용 스타일입니다.

| 화면/요소 | 주 스타일 파일 |
| --- | --- |
| 헤더 | `src/components/Header.module.scss` |
| 메인 배너 | `src/components/MainBanner.module.scss` |
| 카테고리 | `src/components/CategoryMenu.module.scss` |
| 상품 카드 | `src/components/ProductCard.module.scss` |
| 상품 카드 목록 배치 | `src/components/ProductList.module.scss` |
| 상품 필터/정렬 | `src/components/ProductFilter.module.scss`, `ProductSort.module.scss` |
| 상품 목록 페이지 제목 | `src/pages/Products.module.scss` |
| 상품 상세 전체 | `src/pages/ProductDetail.module.scss` |
| 수량 버튼 | `src/components/QuantityControl.module.scss` |

전역 초기화와 폰트 등은 `src/styles/global.scss`, `src/styles/reset.scss`, `src/style.css`에 있습니다.
