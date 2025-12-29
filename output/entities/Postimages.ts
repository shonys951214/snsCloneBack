import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Posts } from "./Posts";
import { Images } from "./Images";

@Index("postId", ["postId"], {})
@Index("imageId", ["imageId"], {})
@Entity("postimages", { schema: "sns" })
export class Postimages {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "postId" })
  postId: number;

  @Column("int", { name: "imageId" })
  imageId: number;

  @ManyToOne(() => Posts, (posts) => posts.postimages, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "postId", referencedColumnName: "id" }])
  post: Posts;

  @ManyToOne(() => Images, (images) => images.postimages, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "imageId", referencedColumnName: "id" }])
  image: Images;
}
