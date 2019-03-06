FROM node:alpine

# 앱 디렉토리 생성
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# 패키지 파일 받기
COPY package*.json ./
RUN apk --no-cache --virtual build-dependencies add \
  python \
  make \
  g++ \
  && npm install \
  && apk del build-dependencies

# 앱 소스 추가
COPY . .

# 서버 설정
ENV NODE_ENV production
ENV AWS_REGION ap-northeast-2
EXPOSE 80

RUN npm run build

# 서버 실행
CMD ["npm", "start"]