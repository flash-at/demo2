import React, { useState } from 'react'
import { Plus, Edit2, Trash2, Star, Search, Tag } from 'lucide-react'
import { useRealTimeSubscription } from '../../hooks/useSupabase'
import { supabase, Note } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const NotesManager: React.FC = () => {
  const { currentUser } = useAuth()
  const { data: notes, loading } = useRealTimeSubscription<Note>('notes', undefined, currentUser?.uid)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    is_favorite: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    try {
      const noteData = {
        title: formData.title,
        content: formData.content,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        is_favorite: formData.is_favorite,
        user_id: currentUser.uid,
        updated_at: new Date().toISOString()
      }

      if (editingNote) {
        const { error } = await supabase
          .from('notes')
          .update(noteData)
          .eq('id', editingNote.id)
        
        if (error) throw error
        toast.success('Note updated successfully!')
      } else {
        const { error } = await supabase
          .from('notes')
          .insert([{ ...noteData, created_at: new Date().toISOString() }])
        
        if (error) throw error
        toast.success('Note created successfully!')
      }

      // Reset form
      setFormData({
        title: '',
        content: '',
        tags: '',
        is_favorite: false
      })
      setShowAddForm(false)
      setEditingNote(null)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleEdit = (note: Note) => {
    setEditingNote(note)
    setFormData({
      title: note.title,
      content: note.content,
      tags: note.tags?.join(', ') || '',
      is_favorite: note.is_favorite
    })
    setShowAddForm(true)
  }

  const handleDelete = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
      
      if (error) throw error
      toast.success('Note deleted successfully!')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const toggleFavorite = async (noteId: string, currentFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ 
          is_favorite: !currentFavorite,
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId)
      
      if (error) throw error
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  // Filter notes based on search and tag
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTag = !selectedTag || (note.tags && note.tags.includes(selectedTag))
    return matchesSearch && matchesTag
  })

  // Get all unique tags
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags || [])))

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-100">Notes Manager</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Note
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500"
          />
        </div>
        
        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500"
        >
          <option value="">All Tags</option>
          {allTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Note title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500"
              required
            />
          </div>
          
          <textarea
            placeholder="Write your note content here..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 mb-4"
            rows={6}
            required
          />

          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="flex-1 px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
            
            <label className="flex items-center gap-2 text-slate-300">
              <input
                type="checkbox"
                checked={formData.is_favorite}
                onChange={(e) => setFormData({ ...formData, is_favorite: e.target.checked })}
                className="rounded border-slate-500 text-purple-500 focus:ring-purple-500"
              />
              Mark as favorite
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              {editingNote ? 'Update Note' : 'Create Note'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false)
                setEditingNote(null)
                setFormData({
                  title: '',
                  content: '',
                  tags: '',
                  is_favorite: false
                })
              }}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full text-center py-8 text-slate-400">
            <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No notes found. Create your first note to get started!</p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-slate-100 flex-1 mr-2">{note.title}</h3>
                <button
                  onClick={() => toggleFavorite(note.id, note.is_favorite)}
                  className={`p-1 transition-colors ${
                    note.is_favorite ? 'text-yellow-400' : 'text-slate-400 hover:text-yellow-400'
                  }`}
                >
                  <Star className={`w-4 h-4 ${note.is_favorite ? 'fill-current' : ''}`} />
                </button>
              </div>
              
              <p className="text-sm text-slate-300 mb-3 line-clamp-3">
                {note.content}
              </p>

              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {note.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{format(new Date(note.created_at), 'MMM dd, yyyy')}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(note)}
                    className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default NotesManager