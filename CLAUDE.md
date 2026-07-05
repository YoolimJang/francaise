# CLAUDE.md — La Française

프랑스어 학습 웹앱. **마크다운 데이터 파일이 곧 데이터베이스**이고, 웹앱은 그 파일들을 읽어 자동으로 화면을 구성한다. 데이터를 추가하면 UI가 알아서 늘어난다.

## 핵심 원칙

1. **콘텐츠와 코드를 분리한다.** 학습 데이터는 전부 `content/` 아래 마크다운으로만 관리한다. 새 단어·문법·표현을 추가할 때 컴포넌트 코드를 건드리지 않는다.
2. **단계(챕터)별로 쌓는다.** 입문(intro) → A1 → A2 … 순서. 지금은 `intro`만 공개.
3. **네 가지 카테고리로 나눈다.** `lessons`(핵심 표현, 과별 회화) / `pronunciation`(발음, 입문 전용) / `grammar`(문법) / `vocabulary`(단어). 사이드바·개요 순서도 이 순.
4. **디자인은 흑백 에디토리얼.** NYT·Medium 감성. 본문 Pretendard, 제목·프랑스어는 세리프(Newsreader). 색은 잉크/종이 계열만 쓰고 컬러 강조는 지양.

## 기술 스택

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS + shadcn 패턴 컴포넌트 (`components/ui/`)
- `gray-matter`로 프론트매터 파싱, `react-markdown` + `remark-gfm`로 본문 렌더
- 폰트: Pretendard(CDN, `app/globals.css`) · Newsreader(`next/font`, `app/layout.tsx`)

## 디렉터리

```
app/
  page.tsx                          홈(마스트헤드 + 챕터 카드)
  [chapter]/layout.tsx              사이드바 셸
  [chapter]/page.tsx                챕터 개요(카테고리 카드)
  [chapter]/[category]/[slug]/      토픽 상세
  globals.css                       테마 토큰 + 에디토리얼 타이포
components/
  masthead.tsx, sidebar.tsx
  content/topic-view.tsx            render 타입별 렌더러
  ui/                               card·badge·tabs·separator
lib/
  types.ts                          도메인 타입(단일 진실 공급원)
  config.ts                         챕터·카테고리 레지스트리
  content.ts                        content/ 로더(server-only)
content/<chapter>/<category>/*.md   ← 학습 데이터(= DB)
scripts/sync-content.mjs            콘텐츠 검증(npm run sync)
```

## 데이터 파일 작성 규칙

경로: `content/<chapter>/<category>/<slug>.md`
예: `content/intro/vocabulary/couleurs.md`

프론트매터 필드:

| 필드 | 필수 | 설명 |
|---|---|---|
| `title` | ✅ | 화면에 보이는 제목 |
| `slug` | | URL 조각 (없으면 파일명 사용) |
| `order` | | 사이드바/목록 정렬용 숫자 |
| `summary` | | 한 줄 설명 |
| `group` | | 카테고리 내 소그룹 라벨. 사이드바에서 소제목으로 묶임 (예: 문법 → `문법`/`동사`, 단어 → `시간`/`음식`) |
| `render` | | 아래 렌더 타입 중 하나 (기본 `prose`) |
| `items` | | 구조화된 데이터 배열 |

`group`이 없는 토픽은 소제목 없이 카테고리 바로 아래 나열된다. 그룹은 소속 토픽 중 가장 작은 `order`를 기준으로 정렬되고, 그룹 내부는 `order` 순이다.

본문(프론트매터 아래)은 마크다운 자유 서술 — 표·인용·굵게 지원. `render`가 `prose`가 아니어도 본문을 추가하면 데이터 아래에 함께 표시된다.

### render 타입과 items 형태

- **`prose`** — items 없음. 문법 설명·과별 회화(lessons) 등 서술형.
- **`letters`** — 발음 카드. `{ fr, ipa, example, ko, note }`
- **`vocab`** — 단어장 리스트. `{ fr, ipa, ko, gender(m|f|m/f) }`
- **`conjugation`** — 동사 변화표. `{ pronoun, form }`
- **`expression`** — 표현. `{ fr, ko, example, exampleKo, note }`

발음은 **IPA(`ipa`)로만** 표기한다. 한글 음차는 부정확해서 쓰지 않는다.

**예문 글로싱**: prose 본문의 예문(리스트 항목) 속 단어에 호버 툴팁이 붙는다 —
**굵게 표시된 활용형 → 원형(+원형 페이지 인라인 링크)**, **명사 → 성(le/la)·수(단/복)**.
사전은 `lib/gloss.ts`(동사 활용형 표 하드코딩 + 단어장 명사 자동 수집), rehype 플러그인으로
`components/content/topic-view.tsx`에서 적용. 새 동사를 링크 대상에 넣으려면 `gloss.ts`의 `VERBS`에 추가.

**연관 항목 버튼**: 토픽에 `related: [{category, slug}]`가 있으면 상세 페이지 하단에
해당 토픽으로 가는 버튼이 뜬다. 변환기가 볼트 노트 끝의 `관련: [[...]]` 링크를 파싱해
자동 생성한다(예: 13과 → 방향·장소 단어장). 위키링크 해석 규칙은 `convert-vault.mjs`의 `resolveLink`.

> ⚠️ YAML 주의: 값에 `"`, `:`, `#`, 앞쪽 `~`가 들어가면 파싱이 깨진다. `summary`처럼 문장을 넣을 땐 특수문자를 피하거나 전체를 작은따옴표로 감싼다. 추가/수정 후 반드시 `npm run sync`로 검증.

## 새 데이터 추가 워크플로

1. `content/<chapter>/<category>/` 에 `.md` 파일 생성 (위 규칙대로)
2. `npm run sync` — 프론트매터·카테고리·render 검증
3. `npm run dev` 로 확인. 파일만 추가하면 사이드바·카드·개수가 자동 반영됨

## 새 챕터(A1 등) 공개 방법

1. `content/a1/{lessons,grammar,vocabulary}/` 에 데이터 작성 (pronunciation은 입문 전용)
2. `lib/config.ts`의 `CHAPTERS`에서 해당 챕터 `available: true`로 변경
3. 끝. 라우팅·네비게이션은 레지스트리를 따라간다.

## 원본 데이터 (source of truth)

`Franciase Data/`는 사용자의 Obsidian 볼트이자 **데이터 원본**이다. 폴더 구조:
`핵심표현/`(과별 회화), `발음/`, `문법/`, `동사/`, `단어장/` + `00-INDEX.md`(MOC) + `단어모음.md`(단어 인박스). 볼트 순서 = **핵심표현 → 발음 → 문법 → 동사 → 단어**.

앱은 이 볼트를 직접 읽지 않는다. 볼트 내용을 `content/`의 앱 포맷으로 **옮겨 담는다**:
- 볼트의 **발음(한글) 열은 앱에 넣지 않는다** (부정확 — IPA만 사용).
- `핵심표현/` → `lessons`(과별 lesson-NN.md, render prose), `발음/` → `pronunciation`, `문법/`+`동사/` → `grammar`, `단어장/` → `vocabulary`(주제 group).
- `단어모음.md`는 사용자의 단어 인박스(작업용 스크래치)이므로 **앱에 넣지 않는다**.
- 문법은 **품사별 group**으로 묶는다: `관사·명사·형용사`(관사·명사·형용사·국가언어국적) / `대명사`(인칭대명사·목적보어) / `전치사·의문사` / `동사` / `기타 구문`(Si·비교급·형용사+de+동사원형·avoir 관용).
- 동사는 군별 한 페이지로 묶는다: `verbes-1er-groupe`(1군, 목록+패턴), `verbes-2e-groupe`(2군), `verbes-3e-groupe`(3군, 핵심 4개 + 그 밖의 동사 표), `verbes-pronominaux`(대명동사). 모두 group `동사`.
- **동사 활용형(구문)은 해당 동사에 붙여 설명한다.** 별도 "동사+동사원형" 페이지를 두지 않고, 각 동사 항목 아래에 그 활용(aller+동사원형=근접미래, vouloir/pouvoir/devoir+동사원형, venir de, essayer de, jouer à/de 등)을 적는다.

볼트가 갱신되면 바뀐 노트를 찾아 대응하는 `content/` 파일을 갱신하고 `npm run sync`로 검증한다.

## 하지 말 것

- 학습 데이터를 컴포넌트/코드에 하드코딩하지 말 것 (항상 `content/`).
- 흑백 팔레트를 벗어난 컬러 강조 남발 금지.
- 새 카테고리를 임의로 만들지 말 것 (네 가지 고정; 확장 시 `types.ts`·`config.ts`·`sync-content.mjs` 함께 수정).
