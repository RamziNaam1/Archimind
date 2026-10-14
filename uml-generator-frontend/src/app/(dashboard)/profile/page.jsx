import ProfileSidebar from '@/components/profile/ProfileSidebar'
import ProfileForm from '@/components/profile/ProfileForm'
import '@/components/profile/profile.css'

export const metadata = {
  title: 'Profile Settings — Archimind',
}

export default function ProfilePage() {
  return (
    <div className="profile-page">

      <ProfileSidebar active="General" />

      <main className="profile-main">
        <div className="profile-content">

          <header className="profile-header">
            <h2 className="profile-title">Profile Settings</h2>
            <p className="profile-subtitle">
              Customize your developer environment and account preferences.
            </p>
          </header>

          <ProfileForm />

        </div>
      </main>

    </div>
  )
}