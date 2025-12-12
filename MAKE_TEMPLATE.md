# GitHub 템플릿 리포지토리 만들기

> 이 리포지토리를 GitHub 템플릿으로 설정하는 방법

## 📋 단계별 가이드

### 1. GitHub에서 템플릿 설정

1. GitHub 리포지토리 페이지로 이동
2. **Settings** 탭 클릭
3. **General** 섹션에서 상단 **"Template repository"** 체크박스 찾기
4. ☑️ **"Template repository"** 체크
5. 변경사항 자동 저장

### 2. 템플릿 준비 체크리스트

템플릿으로 배포하기 전에 다음 사항을 확인하세요:

#### 파일 확인
- [x] `README.md` - 템플릿 사용법 포함
- [x] `TEMPLATE_SETUP.md` - 상세 설정 가이드
- [x] `.env.example` - 환경변수 샘플
- [x] `.env.production` - 플레이스홀더로 변경
- [x] `.github/workflows/deploy.yml` - 플레이스홀더로 변경
- [x] 샘플 포스트 - 템플릿 표시 추가

#### 개인 정보 제거
- [x] `.env.production` - 실제 정보 → 플레이스홀더
- [x] `deploy.yml` - 실제 정보 → 플레이스홀더
- [x] 샘플 포스트 author 필드 - "Template Author"로 변경

#### 문서 확인
- [x] README.md에 템플릿 사용법 명시
- [x] TEMPLATE_SETUP.md 작성 완료
- [x] 라이선스 파일 확인 (MIT License 권장)

### 3. 템플릿에서 새 리포지토리 생성 (테스트)

템플릿이 올바르게 작동하는지 테스트:

1. 템플릿 리포지토리 페이지에서 **"Use this template"** 버튼 확인
2. 버튼 클릭 → **"Create a new repository"** 선택
3. 테스트 리포지토리 생성 (예: `test-blog`)
4. 생성된 리포지토리에서 다음 확인:
   - [ ] 모든 파일이 복사되었는지
   - [ ] `.env.example`이 있는지
   - [ ] `TEMPLATE_SETUP.md`가 있는지
   - [ ] Git 히스토리가 초기화되었는지 (템플릿은 히스토리 없이 복사됨)

### 4. 실제 블로그 생성 (`joonangler.github.io`)

이제 템플릿을 사용하여 실제 블로그를 만들 수 있습니다:

#### GitHub UI 사용

1. 템플릿 리포지토리에서 **"Use this template"** 클릭
2. **Repository name**: `joonangler.github.io` 입력
3. **Public** 선택
4. **"Create repository"** 클릭

#### GitHub CLI 사용

```bash
gh repo create joonangler.github.io --template joonangler/blog --public --clone
cd joonangler.github.io
```

### 5. 새 리포지토리 초기 설정

```bash
# 1. 환경변수 설정
cp .env.example .env.local
# .env.local 편집하여 개인 정보 입력

# 2. .env.production 수정
# NEXT_PUBLIC_SITE_URL=https://joonangler.github.io
# NEXT_PUBLIC_SITE_NAME=JoonAngler Blog
# ... 기타 정보

# 3. .github/workflows/deploy.yml 수정
# 환경변수 값들을 실제 정보로 변경

# 4. 의존성 설치
npm install

# 5. 개발 서버 실행
npm run dev

# 6. 샘플 포스트 제거 (선택)
rm content/posts/2025/getting-started.mdx
rm content/posts/2025/mdx-features.mdx
rm content/posts/2025/typescript-tips.mdx

# 7. 첫 포스트 작성
# content/posts/2025/my-first-post.mdx

# 8. Git 커밋 및 푸시
git add .
git commit -m "feat: 초기 블로그 설정 완료"
git push origin main
```

### 6. GitHub Pages 배포 설정

1. **Settings** → **Pages**
2. **Source**: "GitHub Actions" 선택
3. **Actions** 탭에서 배포 진행 확인
4. 배포 완료 후 `https://joonangler.github.io` 접속

---

## 📝 템플릿 vs 실제 블로그

| 항목 | 템플릿 리포지토리 | 실제 블로그 |
|------|-----------------|-----------|
| 목적 | 재사용 가능한 템플릿 | 개인 블로그 |
| 리포지토리명 | `blog` (자유) | `joonangler.github.io` |
| 환경변수 | 플레이스홀더 | 실제 정보 |
| Git 히스토리 | 전체 히스토리 유지 | 새로운 초기 커밋 |
| 샘플 포스트 | 템플릿 표시 포함 | 제거 또는 수정 |
| 배포 | 하지 않음 | GitHub Pages 자동 배포 |

---

## 🔄 템플릿 업데이트 관리

템플릿을 업데이트한 후, 기존 블로그에 업데이트를 적용하려면:

### 방법 A: 수동 복사

1. 템플릿 리포지토리에서 변경된 파일 확인
2. 필요한 파일만 복사하여 블로그 리포지토리에 적용

### 방법 B: Remote 추가

```bash
# 블로그 리포지토리에서
git remote add template https://github.com/joonangler/blog.git
git fetch template
git merge template/main --allow-unrelated-histories
# 충돌 해결 후 커밋
```

**주의**: 개인 설정이 덮어씌워질 수 있으므로 신중하게 적용하세요.

---

## 🎯 완료!

이제 템플릿 리포지토리가 준비되었습니다!

- ✅ 템플릿 설정 완료
- ✅ 개인 정보 제거
- ✅ 문서 작성 완료
- ✅ "Use this template" 버튼 활성화

누구나 이 템플릿을 사용하여 자신만의 Next.js 블로그를 쉽게 만들 수 있습니다! 🚀

---

## 📚 추가 리소스

- [GitHub Template Repositories 문서](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository)
- [TEMPLATE_SETUP.md](./TEMPLATE_SETUP.md) - 사용자를 위한 상세 가이드
- [README.md](./README.md) - 템플릿 소개

---

**Happy Template Making! 🎉**
