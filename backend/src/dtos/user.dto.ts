export type UserDto = {
  id: number;
  email: string;
  name: string;
  createdAt: string;
};

export type CreateUserDto = {
  email: string;
  name: string;
};

export type UpdateUserDto = CreateUserDto;
