import { Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from '../components/common/PrivateRoute'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import Home from '../pages/home/Home'
import Profile from '../pages/profile/Profile'
import Groups from '../pages/groups/Groups'
import GroupDetails from '../pages/groups/GroupDetails'
import Messages from '../pages/messages/Messages'
import Friends from '../pages/friends/Friends'
import Settings from '../pages/settings/Settings'
import NotFound from '../pages/NotFound'

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/profile/:userId?" element={<Profile />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/groups/:groupId" element={<GroupDetails />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}