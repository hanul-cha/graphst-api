import { GraphstServer } from 'graphst';
import { DataSource } from 'typeorm';
import { UserResolver } from './user/user.resolver';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { LikeResolver } from './like/like.resolver';
import { PostResolver } from './post/post.resolver';
import { CategoryResolver } from './category/category.resolver';
import { CommentResolver } from './comment/comment.resolver';

console.log(process.env.DB_DATABASE);
console.log(process.env.JWT_SECRET_KEY);

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? +process.env.DB_PORT : 3306,
  database: process.env.DB_DATABASE,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  synchronize: false,
  entities: [__dirname + '/**/*.entity.js'],
});

dataSource
  .initialize()
  .then(() => {
    console.log('Data Source has been initialized! 🛠️');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  })
  .finally(() => {
    const server = new GraphstServer({
      providers: [
        {
          key: DataSource,
          instance: dataSource,
        },
      ],
      resolvers: [
        UserResolver,
        LikeResolver,
        PostResolver,
        CategoryResolver,
        CommentResolver,
      ],
      middlewares: [JwtMiddleware],
    });

    server.start(4000, () => {
      console.log('Server start port: 4000');
      console.log('Happy Hacking! 🚀🚀🚀');
    });
  });
