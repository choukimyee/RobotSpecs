'use client'

import React, { useState, useEffect } from 'react'
import { User, Shield, Ban, Check, Mail, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { IUser } from '@/types'

const roles = [
  { value: 'user', label: '普通用户', color: 'secondary' },
  { value: 'editor', label: '编辑员', color: 'default' },
  { value: 'admin', label: '管理员', color: 'warning' },
  { value: 'superadmin', label: '超级管理员', color: 'danger' },
]

export default function UsersPage() {
  const [users, setUsers] = useState<IUser[]>([])
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<IUser | null>(null)
  const [editForm, setEditForm] = useState<{
    role: 'guest' | 'user' | 'editor' | 'admin' | 'superadmin'
    isActive: boolean
  }>({
    role: 'user',
    isActive: true,
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const result = await response.json()
      if (result.success) {
        setUsers(result.data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const openEditDialog = (user: IUser) => {
    setEditingUser(user)
    setEditForm({
      role: user.role,
      isActive: user.isActive,
    })
    setEditDialogOpen(true)
  }

  const handleSave = async () => {
    if (!editingUser) return
    
    try {
      const response = await fetch(`/api/users/${editingUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      const result = await response.json()
      
      if (result.success) {
        setUsers(users.map(u => 
          u._id === editingUser._id ? { ...u, ...editForm } : u
        ))
        setEditDialogOpen(false)
      } else {
        alert(result.error || '更新失败')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('更新失败')
    }
  }

  const toggleUserStatus = async (user: IUser) => {
    const newStatus = !user.isActive
    const message = newStatus ? '启用该用户？' : '禁用该用户？'
    if (!confirm(message)) return
    
    try {
      const response = await fetch(`/api/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      })
      const result = await response.json()
      
      if (result.success) {
        setUsers(users.map(u => 
          u._id === user._id ? { ...u, isActive: newStatus } : u
        ))
      } else {
        alert(result.error || '操作失败')
      }
    } catch (error) {
      console.error('Error toggling user status:', error)
      alert('操作失败')
    }
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = roles.find(r => r.value === role)
    return (
      <Badge variant={roleConfig?.color as 'default' | 'secondary' | 'success' | 'warning' | 'danger' || 'secondary'}>
        {roleConfig?.label || role}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">用户管理</h1>
        <div className="text-sm text-gray-500">
          共 {users.length} 个用户
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">用户</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">邮箱</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">角色</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">注册时间</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">最后登录</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.isActive ? 'success' : 'danger'}>
                      {user.isActive ? '正常' : '禁用'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString('zh-CN')
                      : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEditDialog(user)}
                      >
                        <Shield className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => toggleUserStatus(user)}
                        className={user.isActive ? 'text-danger hover:text-danger' : 'text-success hover:text-success'}
                      >
                        {user.isActive ? (
                          <Ban className="h-4 w-4" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    暂无用户
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* 编辑对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑用户权限</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">用户: {editingUser?.name}</p>
              <p className="text-sm text-gray-500">邮箱: {editingUser?.email}</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">用户角色</label>
              <Select
                value={editForm.role}
                onValueChange={(v) => setEditForm({ ...editForm, role: v as 'guest' | 'user' | 'editor' | 'admin' | 'superadmin' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={editForm.isActive}
                onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="isActive" className="text-sm">启用账户</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
