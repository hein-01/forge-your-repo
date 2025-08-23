import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Bookmark, CheckCircle, Check, X, BadgeCheck, MapPin, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  city: string;
  state: string;
  rating: number;
  image_url: string;
  website: string;
}

const PopularBusinesses = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const { data, error } = await supabase.rpc('get_public_businesses');
      
      if (error) {
        console.error('Error fetching businesses:', error);
        return;
      }

      if (data) {
        setBusinesses(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-3 h-3 drop-shadow-sm ${
          index < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Popular Businesses</h2>
          <div className="flex justify-center">
            <div className="text-muted-foreground">Loading businesses...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Popular Businesses</h2>
        
        <div className="flex flex-wrap justify-center">
          {businesses.map((business) => (
            <Card key={business.id} className="group w-[320px] h-[455px] flex flex-col shadow-lg hover:shadow-2xl transition-all duration-300 mx-[5px] md:mx-[10px] mb-4">
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={business.image_url ? `${business.image_url}?width=320&height=200&resize=cover` : "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=320&h=200&fit=crop"}
                  alt={`${business.name} products`}
                  className="w-[320px] h-[200px] object-cover transition-transform duration-300 hover:scale-105"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 px-1 py-2 h-auto w-6 bg-white/80 hover:bg-white"
                >
                  <Bookmark className="w-3 h-5 text-gray-600" />
                </Button>
              </div>
              
              <CardContent className="flex-1 p-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {renderStars(business.rating)}
                    </div>
                    <span className="text-sm font-medium text-foreground">From $5</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <img 
                        src={business.image_url || "https://images.unsplash.com/photo-1592659762303-90081d34b277?w=40&h=40&fit=crop"} 
                        alt="Business logo" 
                        className="w-10 h-10 rounded-md object-cover"
                      />
                      <BadgeCheck className="w-4 h-4 text-white absolute -top-1 -right-1 rounded-full bg-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm text-foreground leading-tight line-clamp-2">
                        {business.name}
                      </h3>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-500" />
                    {business.city}, {business.state}
                  </p>
                  
                  {business.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {business.description}
                    </p>
                  )}
                  
                  {/* Payment and Delivery Options */}
                  <div className="flex flex-wrap gap-x-1 gap-y-1">
                    <div>
                      <span className="text-xs px-2 py-0.5 rounded border border-green-600 text-green-600">Cash on Delivery</span>
                    </div>
                    
                    <div>
                      <span className="text-xs px-2 py-0.5 rounded border border-blue-600 text-blue-600">Pickup In-Store</span>
                    </div>
                    
                    <div>
                      <span className="text-xs px-2 py-0.5 rounded border border-purple-600 text-purple-600">Digital Payments</span>
                    </div>
                    
                    <div>
                      <span className="text-xs px-2 py-0.5 rounded border border-orange-600 text-orange-600">Next-Day Delivery</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mt-2">
                  <Button 
                    variant="outline" 
                    className="w-full h-8 text-xs bg-[#F5F8FA] hover:bg-[#E8EEF2] border-border"
                  >
                    See Products Catalog
                  </Button>
                  
                  <Button 
                    className="w-full h-8 text-xs flex items-center justify-center gap-1"
                    onClick={() => business.website && window.open(business.website, '_blank')}
                  >
                    Visit Website
                    <ChevronRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularBusinesses;