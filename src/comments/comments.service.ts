import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleEntity } from '../DB/Entities/article.entity';
import { Repository } from 'typeorm';
import { CommentEntity } from '../DB/Entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentEntityRepository: Repository<CommentEntity>,
  ) {}

  async create(createCommentDto: CreateCommentDto, userId: string) {
    // @ts-ignore
    const comment = this.commentEntityRepository.create({
      text: createCommentDto.text,
      article_id: createCommentDto.articleId,
      // @ts-ignore
      user: userId,
    });
    await this.commentEntityRepository.save(comment);

    return comment;
  }

  findAll(id: string) {
    return this.commentEntityRepository
      .createQueryBuilder('comment')
      .where({ article_id: id })
      .leftJoinAndSelect('comment.user', 'user')
      .orderBy('comment.createdat', 'DESC')
      .getMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  update(id: number, updateCommentDto: UpdateCommentDto) {
    return `This action updates a #${id} comment`;
  }

  remove(id: number) {
    return `This action removes a #${id} comment`;
  }
}
