

# 🚴‍♂️🇺🇦 Веб-система для організації велосипедних поїздок BikeBuddies (Серверна частина)

**Бекенд дипломного проєкту** — серверна частина веб-платформи для велосипедистів. Забезпечує:
- реєстрацію та автентифікацію користувачів;
- створення, перегляд і управління поїздками;
- спілкування в чатах;
- обробку досягнень, рівнів користувачів та сповіщень;
- взаємодію з платіжною системою Stripe;


>[Клієнтська частина проєкту](https://github.com/teresabacho/front-bike-app)
## Технології

- **NestJS** + **TypeScript**
- **Node.js**
- **PostgreSQL** + **Neon Tech**
- **APIs**
- **JWT** для аутентифікації
- **Socket.IO**
- **TypeORM**

## Встановлення

```bash
git clone https://github.com/yareyaredaz33/back-bike-site.git
cd back-bike-site
npm install
```

###  Налаштування змінних середовища

Створіть базу даних PostgreSQL згідно з налаштуванням у `DATABASE_URL`.
Створіть `.env` файл у корені проєкту із своїми:

```
DATABASE_URL=postgresql://username:password@localhost:5432/your_db
JWT_SECRET=your_jwt_secret
STRIPE_SECRET=your_stripe_secret
```


###  Запуск сервера

```bash
npm run start:dev
```

