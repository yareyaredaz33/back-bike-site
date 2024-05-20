import { UserProfileView } from '../DTO/user.profile.view';
import { UserEntity } from '../../DB/Entities/user.entity';

export class UserModel {
  mapUserToProfileInfoView(user: UserEntity): UserProfileView {
    return {
      id: user.id,
      first: user?.first,
      lastname: user?.lastname,
      age: user?.age,
      city: user?.city,
      username: user.username,
      avatar: user?.avatar,
      // @ts-expect-error-ignore
      isSubscribed: user.isSubscribed || false,
    };
  }
}
