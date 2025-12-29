import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Users } from "./Users";

@Index("userId", ["userId"], {})
@Entity("tokens", { schema: "sns" })
export class Tokens {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "userId" })
  userId: number;

  @Column("text", { name: "refreshToken" })
  refreshToken: string;

  @Column("tinyint", {
    name: "isRevoked",
    nullable: true,
    width: 1,
    default: () => "'0'",
  })
  isRevoked: boolean | null;

  @Column("datetime", { name: "expiresAt" })
  expiresAt: Date;

  @Column("datetime", {
    name: "createdAt",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @ManyToOne(() => Users, (users) => users.tokens, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "userId", referencedColumnName: "id" }])
  user: Users;
}
