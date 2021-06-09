import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  AfterLoad,
} from 'typeorm';

import urls from '../config/urls';

@Entity('users')
class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  profile_image: string;

  protected profile_image_url: string;

  @AfterLoad()
  getUrl() {
    this.profile_image_url = `${urls.profile_image}/${this.profile_image}`;
  }

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default User;
