# DB First 방식으로 엔티티 생성하기

## 1. 데이터베이스 테이블 생성

먼저 `db.md` 파일에 있는 SQL 문을 사용하여 MySQL 데이터베이스에 테이블을 생성합니다.

```bash
# MySQL에 접속하여 SQL 실행
mysql -u root -p sns_db
```

그 다음 MySQL 클라이언트에서 `db.md` 파일의 SQL 문을 복사하여 실행합니다.

## 2. 환경 변수 설정

`.env` 파일에 데이터베이스 연결 정보를 설정합니다:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=sns_db
```

## 3. 엔티티 생성

### 방법 1: npm 스크립트 사용 (권장)

```bash
npm run typeorm:generate
```

### 방법 2: 직접 명령어 실행

```bash
npx typeorm-model-generator \
  -h localhost \
  -d sns_db \
  -u root \
  -x your_password \
  -e mysql \
  -o src/entities
```

또는 환경 변수 사용:

```bash
typeorm-model-generator \
  -h $DB_HOST \
  -d $DB_DATABASE \
  -u $DB_USERNAME \
  -x $DB_PASSWORD \
  -e mysql \
  -o src/entities
```

## 4. 생성된 엔티티 확인

엔티티는 `src/entities/` 디렉토리에 생성됩니다:
- `User.ts` (또는 `Users.ts`)
- `Token.ts` (또는 `Tokens.ts`)
- `Post.ts` (또는 `Posts.ts`)
- `Image.ts` (또는 `Images.ts`)
- `PostImage.ts` (또는 `PostImages.ts`)

**참고**: TypeORM Model Generator는 테이블명을 기반으로 클래스명을 생성합니다. camelCase 테이블명(`postImages`)의 경우 클래스명이 `PostImage` 또는 `PostImages`로 생성될 수 있습니다.

## 5. 엔티티 파일 수정

생성된 엔티티 파일들을 프로젝트에 맞게 수정해야 할 수 있습니다:

1. **파일 확장자 변경**: `.ts` → `.entity.ts`
2. **클래스명 확인**: TypeORM 데코레이터가 올바르게 적용되었는지 확인
3. **관계 설정 확인**: OneToMany, ManyToOne 등의 관계가 올바르게 설정되었는지 확인
   - `User` ↔ `Token` (OneToMany/ManyToOne)
   - `User` ↔ `Post` (OneToMany/ManyToOne)
   - `User` ↔ `Image` (OneToMany/ManyToOne)
   - `Post` ↔ `PostImage` (OneToMany/ManyToOne)
   - `Image` ↔ `PostImage` (OneToMany/ManyToOne)
4. **인덱스 확인**: 필요한 인덱스가 올바르게 설정되었는지 확인
5. **필드명 확인**: camelCase 필드명이 올바르게 매핑되었는지 확인

## 6. app.module.ts 업데이트

생성된 엔티티를 `app.module.ts`에 등록합니다:

```typescript
import { User } from './entities/user.entity';
import { Token } from './entities/token.entity';
import { Post } from './entities/post.entity';
import { Image } from './entities/image.entity';
import { PostImage } from './entities/post-image.entity';

// TypeOrmModule.forRootAsync의 entities 배열에 추가
entities: [User, Token, Post, Image, PostImage],
```

또는 동적 로딩 방식 사용 (현재 설정됨):
```typescript
entities: [__dirname + '/entities/*.entity{.ts,.js}'],
```

## 주의사항

- 생성된 엔티티 파일은 자동 생성된 것이므로, 필요에 따라 수동으로 수정해야 할 수 있습니다.
- 관계(Relations) 설정이 올바르게 생성되지 않을 수 있으므로 확인이 필요합니다.
- camelCase 필드명을 사용하는 경우 TypeORM의 `namingStrategy` 설정이 필요할 수 있습니다.
- `postImages`는 중간 테이블이므로 ManyToMany 관계로 설정해야 할 수 있습니다.
