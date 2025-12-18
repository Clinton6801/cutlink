'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
  is_active: boolean
}

interface ServiceManagerProps {
  stylistId: string
}

export default function ServiceManager({ stylistId }: ServiceManagerProps) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '30'
  })

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('stylist_id', stylistId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingService) {
        // Update existing service
        const { error } = await supabase
          .from('services')
          .update({
            name: formData.name,
            description: formData.description,
            price: parseInt(formData.price),
            duration: parseInt(formData.duration)
          })
          .eq('id', editingService.id)

        if (error) throw error
        alert('Service updated!')
      } else {
        // Add new service
        const { error } = await supabase
          .from('services')
          .insert([
            {
              stylist_id: stylistId,
              name: formData.name,
              description: formData.description,
              price: parseInt(formData.price),
              duration: parseInt(formData.duration),
              is_active: true
            }
          ])

        if (error) throw error
        alert('Service added!')
      }

      // Reset form
      setFormData({ name: '', description: '', price: '', duration: '30' })
      setShowAddForm(false)
      setEditingService(null)
      fetchServices()
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  const toggleActive = async (serviceId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !currentStatus })
        .eq('id', serviceId)

      if (error) throw error
      fetchServices()
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  const deleteService = async (serviceId: string) => {
    if (!confirm('Delete this service? This cannot be undone.')) return

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId)

      if (error) throw error
      alert('Service deleted')
      fetchServices()
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  const startEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price.toString(),
      duration: service.duration.toString()
    })
    setShowAddForm(true)
  }

  const cancelEdit = () => {
    setEditingService(null)
    setFormData({ name: '', description: '', price: '', duration: '30' })
    setShowAddForm(false)
  }

  if (loading) {
    return <div className="text-gray-400">Loading services...</div>
  }

  return (
    <div className="space-y-6">
      {/* Services List */}
      {services.length > 0 && (
        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.id}
              className={`p-4 rounded-lg border transition ${
                service.is_active
                  ? 'bg-black border-gray-700'
                  : 'bg-gray-800/50 border-gray-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className={`font-bold text-lg ${
                      service.is_active ? 'text-white' : 'text-gray-500'
                    }`}>
                      {service.name}
                    </h4>
                    {!service.is_active && (
                      <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  {service.description && (
                    <p className="text-gray-400 text-sm mb-2">{service.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-yellow-500 font-bold">₦{service.price.toLocaleString()}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400">{service.duration} mins</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(service)}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleActive(service.id, service.is_active)}
                    className={`px-3 py-1 text-sm rounded transition ${
                      service.is_active
                        ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30'
                        : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                    }`}
                  >
                    {service.is_active ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => deleteService(service.id)}
                    className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 text-sm rounded transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm ? (
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-bold text-white mb-4">
            {editingService ? 'Edit Service' : 'Add New Service'}
          </h3>

          {/* Service Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Service Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
              placeholder="e.g., Classic Fade, Dreadlocks, Beard Trim"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
              placeholder="Brief description of the service..."
            />
          </div>

          {/* Price and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price (₦) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                placeholder="2000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration (mins) *
              </label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
              >
                <option value="15">15 mins</option>
                <option value="30">30 mins</option>
                <option value="45">45 mins</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
                <option value="150">2.5 hours</option>
                <option value="180">3 hours</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={cancelEdit}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg transition"
            >
              {editingService ? 'Update Service' : 'Add Service'}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition"
        >
          + Add New Service
        </button>
      )}

      {services.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-gray-400">
          <p>No services yet. Add your first service to get started!</p>
        </div>
      )}
    </div>
  )
}