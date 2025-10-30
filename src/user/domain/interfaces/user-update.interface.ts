import { IUserCreate } from './user-create.interface';

export interface IUserUpdate extends Partial<IUserCreate> {}
