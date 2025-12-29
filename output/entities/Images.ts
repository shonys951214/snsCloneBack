import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Users } from "./Users";
import { Postimages } from "./Postimages";

@Index("userId", ["userId"], {})
@Entity("images", { schema: "sns" })
export class Images {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "userId" })
  userId: number;

  @Column("text", { name: "url" })
  url: string;

  @Column("varchar", { name: "originalName", nullable: true, length: 255 })
  originalName: string | null;

  @Column("int", { name: "size", nullable: true })
  size: number | null;

  @Column("varchar", { name: "mimeType", nullable: true, length: 100 })
  mimeType: string | null;

  @Column("datetime", {
    name: "createdAt",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @ManyToOne(() => Users, (users) => users.images, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "userId", referencedColumnName: "id" }])
  user: Users;

  @OneToMany(() => Postimages, (postimages) => postimages.image)
  postimages: Postimages[];
}
