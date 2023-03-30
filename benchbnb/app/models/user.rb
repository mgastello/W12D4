class User < ApplicationRecord
  has_secure_password

  validates :username, :email, :session_token, presence: true, uniqueness: true
  validates :username, length: { in: 3..30 }
  validates :email, length: { in: 3..255 }
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :username, format: { without: URI::MailTo::EMAIL_REGEXP, message: "can't be an email" }
  validates :password, length: { in: 6..255 }, allow_nil: true

  before_validation :ensure_session_token

  def self.find_by_credentials(credential, password)
    if URI::MailTo::EMAIL_REGEXP.match?(credential)
      email = credential
      user = User.find_by(email: email)
    else
      username = credential
      user = User.find_by(username: username)
    end

    if user && user.authenticate(password)
      user
    else
      nil
    end
  end

  def reset_session_token!
    self.session_token = generate_unique_session_token
    self.update!(session_token: session_token)
    self.session_token
  end

  private

  def generate_unique_session_token
    token = SecureRandom::urlsafe_base64
    while User.exists?(session_token: token)
      token = SecureRandom::urlsafe_base64
    end

    token
  end

  def ensure_session_token
    self.session_token ||= generate_unique_session_token
  end
end
