import { SetMetadata } from '@nestjs/common';
import { ROLE } from 'src/context/account/account.constant';

export const Roles = (...roles: ROLE[]) => SetMetadata('roles', roles);
