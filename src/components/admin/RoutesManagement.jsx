import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Plus, Search, MoreVertical, Edit, Trash2, MapPin, Save, ImageIcon,
  ArrowRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { 
  createRoute, 
  updateRoute, 
  deleteRoute, 
  toggleRouteStatus 
} from '../../store/slices/routeSlice';

const RoutesManagement = ({ darkMode, cardClasses }) => {
  const dispatch = useDispatch();
  const { routes, loading } = useSelector((state) => state.routes);
  
  const [showDialog, setShowDialog] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    distance: '',
    duration: '',
    active: true,
    imageUrl: ''
  });
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);
    const formDataImg = new FormData();
    formDataImg.append('file', file);
    formDataImg.append('upload_preset', 'FirstCab');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formDataImg,
        }
      );
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      setImagePreview(data.secure_url);
      setFormData(prev => ({ ...prev, imageUrl: data.secure_url }));
      toast.success('Image uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload image. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.from || !formData.to || !formData.distance) {
      toast.error('Please fill all required fields');
      return;
    }

    const routeData = {
      from: formData.from.trim(),
      to: formData.to.trim(),
      distance: parseInt(formData.distance),
      duration: parseInt(formData.duration) || 0,
      active: formData.active,
      imageUrl: formData.imageUrl || ''
    };
    
    try {
      if (editingRoute) {
        await dispatch(updateRoute({ 
          routeId: editingRoute.id, 
          updates: routeData 
        })).unwrap();
        toast.success('Route updated successfully!');
      } else {
        await dispatch(createRoute(routeData)).unwrap();
        toast.success('Route created successfully!');
      }
      
      setShowDialog(false);
      resetForm();
    } catch (error) {
      toast.error(error || 'Operation failed');
    }
  };

  const handleEdit = (route) => {
    setEditingRoute(route);
    setFormData({
      from: route.from,
      to: route.to,
      distance: route.distance.toString(),
      duration: route.duration?.toString() || '',
      active: route.active,
      imageUrl: route.imageUrl || ''
    });
    setImagePreview(route.imageUrl || '');
    setShowDialog(true);
  };

  const handleDelete = async (routeId) => {
    if (!window.confirm('Are you sure you want to delete this route?')) return;
    
    try {
      await dispatch(deleteRoute(routeId)).unwrap();
      toast.success('Route deleted successfully!');
    } catch (error) {
      toast.error(error || 'Failed to delete route');
    }
  };

  const handleToggleStatus = async (route) => {
    try {
      await dispatch(toggleRouteStatus({ 
        routeId: route.id, 
        active: route.active 
      })).unwrap();
      toast.success(`Route ${route.active ? 'deactivated' : 'activated'}!`);
    } catch (error) {
      toast.error(error || 'Failed to update status');
    }
  };

  const resetForm = () => {
    setEditingRoute(null);
    setFormData({
      from: '',
      to: '',
      distance: '',
      duration: '',
      active: true,
      imageUrl: ''
    });
    setImagePreview('');
  };

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = 
      route.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.to.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && route.active) ||
      (filterStatus === 'inactive' && !route.active);
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold">Routes & Trips Management</h2>
          <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
            Create and manage your routes and destinations
          </p>
        </div>
        
        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
              <Plus size={16} className="mr-2" />Create New Route
            </Button>
          </DialogTrigger>
          <DialogContent className={`${darkMode ? 'bg-slate-900 text-slate-100 border-slate-800' : 'bg-white'} max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <DialogHeader>
              <DialogTitle>{editingRoute ? 'Edit Route' : 'Create New Route'}</DialogTitle>
              <DialogDescription>
                Add route details including pickup/drop locations
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input 
                      value={formData.from} 
                      onChange={(e) => setFormData({ ...formData, from: e.target.value })} 
                      placeholder="IIT Kharagpur" 
                      className="pl-10" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>To Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input 
                      value={formData.to} 
                      onChange={(e) => setFormData({ ...formData, to: e.target.value })} 
                      placeholder="Kolkata Airport" 
                      className="pl-10" 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Distance (km) *</Label>
                  <Input 
                    type="number" 
                    value={formData.distance} 
                    onChange={(e) => setFormData({ ...formData, distance: e.target.value })} 
                    placeholder="120" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration (mins)</Label>
                  <Input 
                    type="number" 
                    value={formData.duration} 
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })} 
                    placeholder="150" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Route Image</Label>
                <div className={`border-2 border-dashed ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-50'} rounded-lg p-4`}>
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg" 
                      />
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="absolute top-2 right-2" 
                        onClick={() => { 
                          setImagePreview(''); 
                          setFormData({ ...formData, imageUrl: '' }); 
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center cursor-pointer py-8">
                      <ImageIcon size={48} className="text-slate-400 mb-2" />
                      <span className="text-sm text-slate-500">
                        {uploadingImage ? 'Uploading...' : 'Click to upload image'}
                      </span>
                      <span className="text-xs text-slate-400 mt-1">
                        Max size: 5MB (JPG, PNG)
                      </span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        className="hidden" 
                        disabled={uploadingImage} 
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className={`flex items-center justify-between p-4 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <div>
                  <Label className="font-semibold">Active Status</Label>
                  <p className="text-sm text-slate-500">Make this route visible to users</p>
                </div>
                <Switch 
                  checked={formData.active} 
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })} 
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDialog(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={loading || uploadingImage}
                className="bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
              >
                <Save size={16} className="mr-2" />
                {loading ? 'Saving...' : editingRoute ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input 
            placeholder="Search routes..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10" 
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-45">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Routes</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="inactive">Inactive Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className={cardClasses}>
        <Table>
          <TableHeader>
            <TableRow className={darkMode ? 'border-slate-800' : ''}>
              <TableHead>Route</TableHead>
              <TableHead>Distance</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoutes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <p className="text-slate-500">No routes found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredRoutes.map((route) => (
                <TableRow key={route.id} className={darkMode ? 'border-slate-800' : ''}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {route.imageUrl && (
                        <img 
                          src={route.imageUrl} 
                          alt="Route" 
                          className="w-12 h-12 rounded-lg object-cover" 
                        />
                      )}
                      <div className='flex space-x-2 items-center'>
                        <p className="font-semibold">{route.from}</p>
                        <ArrowRight size={18}/>
                        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                           {route.to}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{route.distance} km</TableCell>
                  <TableCell>{route.duration || 'N/A'} mins</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={route.active} 
                        onCheckedChange={() => handleToggleStatus(route)}
                        disabled={loading}
                      />
                      <Badge 
                        variant={route.active ? 'default' : 'secondary'}
                        className={route.active ? 'bg-emerald-500' : ''}
                      >
                        {route.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(route)}>
                          <Edit size={14} className="mr-2" />Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600" 
                          onClick={() => handleDelete(route.id)}
                        >
                          <Trash2 size={14} className="mr-2" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default RoutesManagement;