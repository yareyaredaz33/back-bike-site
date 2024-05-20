import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Delete, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../Auth/Guards/jwt.auth.guards';
import { Response } from 'express';
@Entity()
export class SubscriptionsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  celebrity_id: string;

  @Column({ type: 'varchar' })
  user_id: string;
}
