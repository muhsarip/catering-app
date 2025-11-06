import BaseTransformer from '../../shared/transformers/base.transformer.js';

class AuthTransformer extends BaseTransformer {
  user(user) {
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  loginResponse(data) {
    return {
      token: data.token,
      user: this.user(data.user),
    };
  }
}

export default AuthTransformer;
