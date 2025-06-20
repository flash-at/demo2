import { Home, User, BookOpen, Code, Trophy } from 'lucide-react'
import { NavBar } from "./tubelight-navbar"

export function TubelightNavbarDemo() {
  const navItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'Courses', url: '/auth', icon: BookOpen },
    { name: 'Problems', url: '/auth', icon: Code },
    { name: 'Leaderboard', url: '/auth', icon: Trophy },
    { name: 'Profile', url: '/auth', icon: User }
  ]

  return <NavBar items={navItems} />
}