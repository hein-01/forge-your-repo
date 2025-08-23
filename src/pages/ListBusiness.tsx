import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Building2, Upload, Calendar, MapPin, Phone, Globe, Facebook, Music, DollarSign, Package, Camera } from "lucide-react";

interface BusinessFormData {
  name: string;
  description: string;
  category: string;
  phone: string;
  licenseExpiredDate: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  website: string;
  facebookPage: string;
  tiktokUrl: string;
  startingPrice: string;
  options: string[];
  productsCatalog: string;
}

const BUSINESS_OPTIONS = [
  "Cash on Delivery",
  "Pickup In-Store", 
  "Digital Payments",
  "Next-Day Delivery"
];

const BUSINESS_CATEGORIES = [
  "Restaurant",
  "Retail Store",
  "Service Business",
  "Healthcare",
  "Beauty & Salon",
  "Technology",
  "Automotive",
  "Real Estate",
  "Education",
  "Entertainment",
  "Other"
];

export default function ListBusiness() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [productImages, setProductImages] = useState<File[]>([]);
  
  const [formData, setFormData] = useState<BusinessFormData>({
    name: "",
    description: "",
    category: "",
    phone: "",
    licenseExpiredDate: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    website: "",
    facebookPage: "",
    tiktokUrl: "",
    startingPrice: "",
    options: [],
    productsCatalog: ""
  });

  const handleInputChange = (field: keyof BusinessFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (option: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      options: checked 
        ? [...prev.options, option]
        : prev.options.filter(opt => opt !== option)
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleProductImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 3); // Max 3 images
      setProductImages(files);
    }
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
    
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to list your business.",
        variant: "destructive",
      });
      navigate('/auth/signin');
      return;
    }

    setLoading(true);

    try {
      let logoUrl = "";
      let imageUrls: string[] = [];

      // Upload logo if provided
      if (logoFile) {
        const logoPath = `logos/${user.id}/${Date.now()}_${logoFile.name}`;
        logoUrl = await uploadFile(logoFile, 'business-assets', logoPath);
      }

      // Upload product images if provided
      if (productImages.length > 0) {
        const uploadPromises = productImages.map((file, index) => {
          const imagePath = `products/${user.id}/${Date.now()}_${index}_${file.name}`;
          return uploadFile(file, 'business-assets', imagePath);
        });
        imageUrls = await Promise.all(uploadPromises);
      }

      // Create business listing
      const { error } = await supabase
        .from('businesses')
        .insert({
          owner_id: user.id,
          name: formData.name,
          description: formData.description,
          category: formData.category,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          website: formData.website,
          image_url: logoUrl || null,
          // Store additional data in JSON fields (you may need to add these columns)
          // facebook_page: formData.facebookPage,
          // tiktok_url: formData.tiktokUrl,
          // starting_price: formData.startingPrice,
          // business_options: formData.options,
          // products_catalog: formData.productsCatalog,
          // license_expired_date: formData.licenseExpiredDate,
          // product_images: imageUrls
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your business has been listed successfully.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error listing business:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to list business. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">Please sign in to list your business.</p>
          <Button onClick={() => navigate('/auth/signin')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">List Your Business</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join our directory and connect with customers in your area. Fill out the form below to get started.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Business Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your business name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Business Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your business, services, and what makes you unique..."
                  rows={4}
                  required
                />
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label htmlFor="logo">Business Logo</Label>
                <div className="flex items-center gap-4">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="flex-1"
                  />
                </div>
                {logoFile && (
                  <p className="text-sm text-muted-foreground">Selected: {logoFile.name}</p>
                )}
              </div>

              {/* Product Images */}
              <div className="space-y-2">
                <Label htmlFor="productImages">Product Images (Max 3)</Label>
                <div className="flex items-center gap-4">
                  <Camera className="h-5 w-5 text-muted-foreground" />
                  <Input
                    id="productImages"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleProductImagesChange}
                    className="flex-1"
                  />
                </div>
                {productImages.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {productImages.length} image(s)
                  </p>
                )}
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="licenseExpiredDate">License Expiration Date</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="licenseExpiredDate"
                      type="date"
                      value={formData.licenseExpiredDate}
                      onChange={(e) => handleInputChange('licenseExpiredDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Store Address *</Label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="123 Main Street"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="City"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="State"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      placeholder="12345"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Online Presence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="website">Website URL</Label>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://yourbusiness.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="facebookPage">Facebook Page URL</Label>
                  <div className="flex items-center gap-2">
                    <Facebook className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="facebookPage"
                      value={formData.facebookPage}
                      onChange={(e) => handleInputChange('facebookPage', e.target.value)}
                      placeholder="https://facebook.com/yourbusiness"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiktokUrl">TikTok URL</Label>
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="tiktokUrl"
                    value={formData.tiktokUrl}
                    onChange={(e) => handleInputChange('tiktokUrl', e.target.value)}
                    placeholder="https://tiktok.com/@yourbusiness"
                  />
                </div>
              </div>

              {/* Pricing & Services */}
              <div className="space-y-2">
                <Label htmlFor="startingPrice">Starting Price</Label>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="startingPrice"
                    value={formData.startingPrice}
                    onChange={(e) => handleInputChange('startingPrice', e.target.value)}
                    placeholder="$25.00"
                  />
                </div>
              </div>

              {/* Business Options */}
              <div className="space-y-4">
                <Label>Business Options</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {BUSINESS_OPTIONS.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={option}
                        checked={formData.options.includes(option)}
                        onCheckedChange={(checked) => handleOptionChange(option, checked === true)}
                      />
                      <Label htmlFor={option} className="text-sm font-normal">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Products Catalog */}
              <div className="space-y-2">
                <Label htmlFor="productsCatalog">Products Catalog</Label>
                <div className="flex items-start gap-2">
                  <Package className="h-4 w-4 text-muted-foreground mt-1" />
                  <Textarea
                    id="productsCatalog"
                    value={formData.productsCatalog}
                    onChange={(e) => handleInputChange('productsCatalog', e.target.value)}
                    placeholder="List your main products or services with brief descriptions..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Listing Business..." : "List My Business"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}