import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Images } from "./Images";
import { Posts } from "./Posts";
import { Tokens } from "./Tokens";

@Index("email", ["email"], { unique: true })
@Index("nickname", ["nickname"], { unique: true })
@Entity("users", { schema: "sns" })
export class Users {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "email", unique: true, length: 255 })
  email: string;

  @Column("varchar", { name: "password", length: 255 })
  password: string;

  @Column("varchar", { name: "nickname", unique: true, length: 50 })
  nickname: string;

  @Column("datetime", {
    name: "createdAt",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @Column("datetime", {
    name: "updatedAt",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date | null;

  @Column("varchar", {
    name: "profileImage",
    nullable: true,
    length: 500,
    default: () =>
      "'https://eafpdayrnocflxjptkrm.supabase.co/storage/v1/object/public/uploads/defaultProfile.png'",
  })
  profileImage: string | null;

  @OneToMany(() => Images, (images) => images.user)
  images: Images[];

  @OneToMany(() => Posts, (posts) => posts.user)
  posts: Posts[];

  @OneToMany(() => Tokens, (tokens) => tokens.user)
  tokens: Tokens[];
}
