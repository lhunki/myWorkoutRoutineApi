# My Workout Routine

## 개요

이 프로젝트는 **운동 기록 및 조회 API**를 위한 Node.js 기반의 서버입니다. 이 API를 통해 사용자는 자신의 운동 데이터를 기록하고, 조회할 수 있습니다.

### 기능
- 사용자 인증 및 권한 관리 (자체 회원 가입, GitHub 로그인)
- 운동 기록 생성, 수정, 삭제
- 특정 날짜 또는 기간의 운동 기록 조회
- 여러 운동을 루틴으로 저장, 운동 기록에 일괄적으로 추가
- 특정 기간의 운동 통계 조회 (운동 기록 수, 각 종목별 운동 횟수)
- Personal record 조회 (종목별, 최대 반복수 별 최대 무게 검색)

### 사용한 기술
- Node.js / Express / Sequelize
- JWT, GitHub OAuth api를 사용한 사용자 인증
- bcrypt를 사용한 db 비밀번호 단방향 암호화


---
<br/>

## 데이터베이스 구조

### ERD

![ERD](./ERD.png)

---
<br/>

## API 엔드포인트

<details>
<summary><strong>1. 인증</strong></summary>

#### $$\color{green}POST$$ /auth/register

- 설명: 사용자 등록
- 요청:
  - 바디:
  ```json
  {
    "loginId": "user1",
    "userName": "lee hunki",
    "password": "1234",
    "email": "user@gmail.com"
  }
  ```

#### $$\color{green}POST$$ /auth/login

- 설명: 사용자 로그인
- 요청:
  - 바디:
  ```json
  {
    "loginId": "user1",
    "password": "1234"
  }
  ```
- 응답 예시:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQ..."
  }
  ```

#### 등록, 로그인을 제외한 모든 API 요청 헤더에는 인증시 발급받은 JWT를 포함해야 함

- 헤더:
  ```json
  {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQ..."
  }
  ```
  </details>

<details>
<summary><strong>2. 운동 기록 (Workout)</strong></summary>

#### $$\color{lightblue}GET$$ /workout/date

- 설명: 특정 날짜의 운동 기록 조회
- 요청:
  - 쿼리: `required` date=YYYY-MM-DD
- 응답 예시:
  ```json
  [
    {
      "id": 7,
      "userId": 7,
      "date": "2025-02-04T00:00:00.000Z",
      "notes": "Free PT",
      "Exercises": [
        {
          "id": 12,
          "name": "Squat",
          "description": null,
          "target_muscle": null,
          "userId": 7,
          "Workout_Exercise": {
            "workoutId": 7,
            "exerciseId": 12,
            "sets": 5,
            "reps": 5,
            "weight": 70
          }
        }
      ]
    }
  ]
  ```

#### $$\color{lightblue}GET$$ /workout/list_all

- 설명: 모든 운동 기록 조회

#### $$\color{lightblue}GET$$ /workout/monthly

- 설명: 월간 운동 기록 조회
- 요청:
  - 쿼리: `required` year=YYYY & month = M

#### $$\color{lightblue}GET$$ /workout/statistics

- 설명: 기간별 운동 통계 조회
- 요청:
  - 쿼리: `required` startDate=YYYY-MM-DD & endDate=YYYY-MM-DD
- 응답 예시:
  ```json
  {
    "workoutCount": 3,
    "exerciseCount": {
      "Squat": 3,
      "Leg extension": 1,
      "Pull up": 1,
      "Dead lift": 1,
      "Panata low row": 1,
      ...
    }
  }
  ```

#### $$\color{green}POST$$ /workout

- 설명: 운동 기록 추가
- 요청:
  - 바디:
  ```json
  {
    "date": "2025-02-04",
    "notes": "Some notes ..."
  }
  ```

#### $$\color{green}POST$$ /workout/add_exercise

- 설명: 운동 기록에 운동 종목 추가
- 요청:
  - 쿼리: `required` workoutId
  - 바디:
  ```json
  {
    "name": "Squat",
    "sets": 3,
    "reps": 1,
    "weight": 80
  }
  ```

#### $$\color{red}DELETE$$ /workout

- 설명: 운동 기록 삭제
- 요청:
  - 쿼리: `required` workoutId

</details>

<details>
<summary><strong>3. 운동 종목 (Exercise)</strong></summary>

#### $$\color{lightblue}GET$$ /exercise/list_all

- 설명: 전체 운동 종목 조회

#### $$\color{lightblue}GET$$ /exercise/personal_record

- 설명: 개인 기록 조회 (최대 수행 무게)
- 요청:
  - 쿼리: `required` exerciseId
- 응답 예시:
  ```json
  {
    "name": "Squat",
    "maxWeight": 80
  }
  ```

#### $$\color{green}POST$$ /exercise

- 설명: 운동 종목 추가
- 요청:
  - 바디:
  ```json
  {
    "name": "Bench press",
    "description": "some descriptions ...",
    "target_muscle": "Pectoral"
  }
  ```

</details>

<details>
<summary><strong>4. 운동 루틴 (Routine)</strong></summary>

#### $$\color{lightblue}GET$$ /routine/list_all

- 설명: 전체 운동 루틴 조회
- 응답 예시:
  ```json
  [
    {
      "id": 4,
      "userId": 7,
      "name": "Leg day",
      "description": "some descriptions ...",
      "Exercises": [
        {
          "id": 12,
          "name": "Squat",
          "description": null,
          "target_muscle": null,
          "userId": 7,
          "Routine_Exercise": {
            "routineId": 4,
            "exerciseId": 12,
            "sets": 5,
            "reps": 5,
            "weight": 70,
          }
        },
        ...
      ]
    }
  ]
  ```

#### $$\color{lightblue}GET$$ /routine/{routine_id}

- 설명: 운동 루틴 조회 (id별)

#### $$\color{green}POST$$ /routine

- 설명: 운동 루틴 추가
- 요청:
  - 바디:
  ```json
  {
    "name": "Leg day",
    "description": "some descriptions ..."
  }
  ```

#### $$\color{green}POST$$ /routine/add_exercise

- 설명: 루틴에 운동 종목 추가
- 요청:
  - 쿼리: `required` routineId
  - 바디:
  ```json
  {
    "name": "Squat",
    "sets": 5,
    "reps": 5,
    "weight": 70
  }
  ```

</details>

<br/>

---

<br/>

## 설치 및 실행

### 1. 사전 요구사항

- Node.js
- MySQL

### 2. 설치

```bash
$ git clone https://github.com/lhunki/myWorkoutRoutineApi.git

$ cd myWorkoutRoutineApi

$ npm install
```

### 3. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 아래 내용을 추가:

```
# 서버 설정
PORT=3030
NODE_ENV=development

# 데이터베이스 설정
DB_DIALECT=mysql
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=my_workout_routine

# JWT 설정
JWT_SECRET=your_jwt_secret
```

### 4. 데이터베이스 초기화

```bash
$ npx sequelize db:create

$ npx sequelize db:migrate
```

### 5. 서버 실행

```bash
$ npm start
```
