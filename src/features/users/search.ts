export type UsersSearch = {
  limit: number;
  offset: number;
};

export const defaultUsersSearch: UsersSearch = {
  limit: 20,
  offset: 0,
};
