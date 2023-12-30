
//** 제네레이터란? **//
// 프리즈마 명령을 실행하는 환경을 결정 하는 필드.
// generator client {
//     provider = "prisma-client-js"
//   }
// ** 데이터 소스 ** //
// 프리즈마를 사용하여 연결 할 데이터 베이스의 정보를 설정 해주는 필드.
//   datasource db {
//     provider = "mysql"
//     url      = env("DATABASE_URL")
//   }

// ** 모델 - 데이터 베이스 테이블에 매핑 되는 개념. **//
// 쉽게 말해서 스키마 정도로 알고 있음.
// 프리즈마에 기본으로 내장이 되어 있는 6가지의 스칼라 타입.
// Sting, Boolean, Int, Float, DateTime, Json

// attributes 필드에 기본값이나 유니크키, 인덱스키, 릴레이션 등 을 설정 하는것. (키워드는 @로 시작.)
// @id (primary key), @default (default), @unique, @@index, @relation, @map, @updateAt

// 미리 설정한 ERD 를 통헤서 스키마 를 설정 한다.
// ERD 에 관해서는 과제 내용에 자세한 설명이 들어있음.

// 모델 이름 매핑.
//   model Review {
    // 아이디  인트      아이디는 디폴트 값으로 1씩 증가한다.
//     id    Int      @id @default(autoincrement()) 
    // 타이틀      문자열    @map 을 통해 데이터베이스 테이블 (title) 에 자동으로 매핑.
//     title     String  @map("title")
    // 전과동
//     book_name String @map("book_name")
    // 전과동               @map 콘텐츠 는 @db 는 (datasource)
//     content   String   @map("content") @db.Text
    // 전과동
//     user_name  String   @map("nickname")
    // 전과듕
//     password  String  @map("password")
    // 별점   인트
//     star  Int
    // 생성 날짜는   데이트타임    기본값이  현재
//     created_at DateTime @default(now()) @map("created_at")
    // 수정된 날짜     전과동.
//     updated_at DateTime @updatedAt @map("updated_at")
    // 필드를 목록 으로 만든다.
//     comments Comment[]
    // @map 과 같은 역할을 함.
//     @@map("Review")
//   }

//   model Comment {
//     id    Int      @id @default(autoincrement()) 
//     content   String   @map("content") @db.Text
//     user_name  String   @map("nickname")
//     password  String   @map("password")
//     created_at DateTime @default(now()) @map("created_at")
//     updated_at DateTime @updatedAt @map("updated_at")
  
//     review Review @relation(fields:[review_id], references:[id])
//     review_id Int
  
  
  
//     @@map("Comment")
//   }