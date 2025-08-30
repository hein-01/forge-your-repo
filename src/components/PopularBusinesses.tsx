import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Facebook, Instagram, MessageCircle, Bookmark, CheckCircle, Check, X, BadgeCheck, MapPin, ChevronRight, ChevronLeft } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
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
  product_images?: string[] | null;
  business_options?: string[] | null;
  starting_price?: string | null;
  license_expired_date?: string | null;
  products_catalog?: string | null;
  facebook_page?: string | null;
  tiktok_url?: string | null;
  phone?: string | null;
}

const PopularBusinesses = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState<string | null>(null);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      // Query businesses table directly to get all fields including products_catalog
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          id,
          name,
          description,
          category,
          city,
          state,
          rating,
          image_url,
          website,
          product_images,
          business_options,
          starting_price,
          license_expired_date,
          products_catalog,
          facebook_page,
          tiktok_url,
          phone
        `)
        .order('created_at', { ascending: false })
        .limit(6);
        
      if (error) {
        console.error('Error fetching businesses:', error);
        return;
      }
      
      console.log('Fetched businesses data:', data);
      if (data && data.length > 0) {
        console.log('First business products_catalog:', data[0]?.products_catalog);
      }
      setBusinesses(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };


  const getOptionColors = (index: number) => {
    const colors = [
      'border-green-600 text-green-600',
      'border-blue-600 text-blue-600', 
      'border-purple-600 text-purple-600',
      'border-orange-600 text-orange-600',
      'border-pink-600 text-pink-600',
      'border-indigo-600 text-indigo-600',
      'border-teal-600 text-teal-600',
      'border-red-600 text-red-600'
    ];
    return colors[index % colors.length];
  };

  const isLicenseValid = (licenseDate?: string | null) => {
    if (!licenseDate) return false;
    
    const expiryDate = new Date(licenseDate);
    const currentDate = new Date();
    
    // Set both dates to start of day for accurate date comparison
    expiryDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
    
    return expiryDate >= currentDate;
  };

  const parseProductsCatalog = (catalogString?: string | null) => {
    console.log('Raw products_catalog:', catalogString);
    if (!catalogString || catalogString.trim() === '') {
      console.log('No catalog string found or empty');
      return [];
    }
    
    // Try to parse as JSON first (in case it's stored as JSON array)
    try {
      const parsed = JSON.parse(catalogString);
      if (Array.isArray(parsed)) {
        console.log('Parsed as JSON array:', parsed);
        return parsed;
      }
    } catch (error) {
      // If JSON parsing fails, treat as comma-separated string
      console.log('JSON parsing failed, treating as comma-separated string');
    }
    
    // Parse as comma-separated string
    const products = catalogString
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    console.log('Parsed as comma-separated string:', products);
    return products;
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
        
        <div className="hidden md:block bg-muted/30 rounded-2xl p-8 mx-4">
          <div className="relative">
            <Swiper
              modules={[Pagination]}
              pagination={{ 
                clickable: true,
                dynamicBullets: false,
                horizontalClass: 'swiper-pagination-horizontal',
                bulletClass: 'swiper-pagination-bullet',
                bulletActiveClass: 'swiper-pagination-bullet-active'
              }}
              spaceBetween={20}
              slidesPerView={1}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 2.5,
                  spaceBetween: 20,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 20,
                },
                1280: {
                  slidesPerView: 4,
                  spaceBetween: 20,
                },
              }}
            loop={false}
            grabCursor={true}
            centeredSlides={false}
            className="popular-businesses-swiper pb-12"
          >
            {businesses.map((business) => (
              <SwiperSlide key={business.id}>
                <Card className="group w-full max-w-[320px] h-[455px] flex flex-col shadow-lg hover:shadow-2xl transition-all duration-300 mx-auto">
              <div className="relative overflow-hidden rounded-t-lg">
                <Swiper
                  modules={[Navigation, Pagination]}
                  navigation={{
                    nextEl: `.swiper-button-next-${business.id}`,
                    prevEl: `.swiper-button-prev-${business.id}`,
                    enabled: true
                  }}
                  pagination={{ 
                    clickable: true,
                    enabled: false 
                  }}
                  spaceBetween={0}
                  slidesPerView={1}
                  loop={true}
                  className="w-full h-[200px] product-carousel"
                >
                  {business.product_images && business.product_images.length > 0 ? (
                    business.product_images.map((image, index) => (
                      <SwiperSlide key={index}>
                        <img
                          src={image}
                          alt={`${business.name} product ${index + 1}`}
                          className="w-full h-[200px] object-cover"
                        />
                      </SwiperSlide>
                    ))
                  ) : (
                    <SwiperSlide>
                      <img
                        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=320&h=200&fit=crop"
                        alt={`${business.name} products`}
                        className="w-full h-[200px] object-cover"
                      />
                    </SwiperSlide>
                  )}
                  
                  {/* Custom Navigation Arrows - only show if multiple images */}
                  {business.product_images && business.product_images.length > 1 && (
                    <>
                      <button 
                        className={`swiper-button-prev-${business.id} absolute left-2 top-1/2 -translate-y-1/2 z-30 w-6 h-6 bg-white/95 rounded-full flex items-center justify-center cursor-pointer hover:bg-white transition-all duration-200 shadow-lg border border-gray-200`}
                        type="button"
                      >
                        <ChevronLeft className="w-3 h-3 text-gray-800" />
                      </button>
                      <button 
                        className={`swiper-button-next-${business.id} absolute right-2 top-1/2 -translate-y-1/2 z-30 w-6 h-6 bg-white/95 rounded-full flex items-center justify-center cursor-pointer hover:bg-white transition-all duration-200 shadow-lg border border-gray-200`}
                        type="button"
                      >
                        <ChevronRight className="w-3 h-3 text-gray-800" />
                      </button>
                    </>
                  )}
                </Swiper>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 px-1 py-2 h-auto w-6 bg-white/80 hover:bg-white z-40"
                >
                  <Bookmark className="w-3 h-3 text-gray-600" />
                </Button>
              </div>
              
              <CardContent className="flex-1 p-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {business.starting_price ? (
                        <span>
                          <span className="text-primary">From</span> {business.starting_price}
                        </span>
                      ) : 'Price on request'}
                    </div>
                    <div className="flex items-center gap-1">
                      {business.facebook_page && (
                        <div 
                          className="w-7 h-7 rounded-full border border-border shadow-md flex items-center justify-center bg-background hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => window.open(business.facebook_page, '_blank')}
                        >
                          <Facebook className="w-3 h-3 text-blue-600" />
                        </div>
                      )}
                      {business.tiktok_url && (
                        <div 
                          className="w-7 h-7 rounded-full border border-border shadow-md flex items-center justify-center bg-background hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => window.open(business.tiktok_url, '_blank')}
                        >
                          <Instagram className="w-3 h-3 text-pink-600" />
                        </div>
                      )}
                      {business.phone && (
                        <div 
                          className="w-7 h-7 rounded-full border border-border shadow-md flex items-center justify-center bg-background hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => window.open(`https://wa.me/${business.phone.replace(/[^\d]/g, '')}`, '_blank')}
                        >
                          <MessageCircle className="w-3 h-3 text-green-600" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <img 
                        src={business.image_url || "https://images.unsplash.com/photo-1592659762303-90081d34b277?w=40&h=40&fit=crop"} 
                        alt="Business logo" 
                        className="w-10 h-10 rounded-md object-cover border border-amber-700"
                      />
                      {isLicenseValid(business.license_expired_date) && (
                        <BadgeCheck className="w-4 h-4 text-white absolute -top-1 -right-1 rounded-full bg-primary" />
                      )}
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
                  
                  
                  {/* Business Options */}
                  {business.business_options && business.business_options.length > 0 && (
                    <div className="flex flex-wrap gap-x-1 gap-y-1">
                      {business.business_options.map((option, index) => (
                        <div key={index}>
                          <span className={`text-xs px-2 py-0.5 rounded border ${getOptionColors(index)}`}>
                            {option}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2 mt-2">
                  <Dialog open={openModal === business.id} onOpenChange={(open) => setOpenModal(open ? business.id : null)}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full h-8 text-xs bg-[#F5F8FA] hover:bg-[#E8EEF2] border-border"
                      >
                        See Products Catalog
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{business.name} - Products Catalog</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3">
                        {parseProductsCatalog(business.products_catalog).length > 0 ? (
                          parseProductsCatalog(business.products_catalog).map((product: string, index: number) => (
                            <div key={index} className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                              <Check className="w-4 h-4 text-primary" />
                              <span className="text-sm">{product}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>No products catalog available</p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  
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
              </SwiperSlide>
            ))}
            
            {/* Fixed seventh card - Discover more shops */}
            <SwiperSlide key="discover-more">
              <Card className="group w-full max-w-[320px] h-[455px] flex flex-col shadow-lg hover:shadow-2xl transition-all duration-300 mx-auto bg-gradient-to-br from-slate-800 to-slate-900">
                <div className="relative overflow-hidden rounded-t-lg h-[200px] bg-gradient-to-br from-slate-700 to-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=320&h=200&fit=crop"
                    alt="Discover more shops"
                    className="w-full h-[200px] object-cover opacity-30"
                  />
                </div>
                
                <CardContent className="flex-1 p-3 flex flex-col justify-center items-center text-center">
                  <div className="space-y-4">
                    <h3 className="text-white text-lg font-bold">
                      Discover more shops
                    </h3>
                    <p className="text-white/80 text-sm">
                      Explore hundreds of businesses and find exactly what you're looking for
                    </p>
                    <Button 
                      style={{ backgroundColor: '#EAB33A' }}
                      className="w-full h-10 text-black font-medium hover:opacity-90 transition-opacity"
                    >
                      Go Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </SwiperSlide>
           </Swiper>
          </div>
        </div>
        
        {/* Mobile version without background container */}
        <div className="block md:hidden">
          <div className="relative">
            <Swiper
              modules={[Pagination]}
              pagination={{ 
                clickable: true,
                dynamicBullets: false,
                horizontalClass: 'swiper-pagination-horizontal'
              }}
              spaceBetween={20}
              slidesPerView={1.15}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 2.5,
                  spaceBetween: 20,
                },
              }}
              loop={false}
              grabCursor={true}
              centeredSlides={false}
              className="popular-businesses-swiper-mobile pb-12 pl-4"
            >
              {businesses.map((business) => (
                <SwiperSlide key={business.id}>
                  <Card className="group w-full max-w-[320px] h-[455px] flex flex-col shadow-lg hover:shadow-2xl transition-all duration-300 mx-auto">
                <div className="relative overflow-hidden rounded-t-lg">
                  <Swiper
                    modules={[Navigation, Pagination]}
                    navigation={{
                      nextEl: `.swiper-button-next-mobile-${business.id}`,
                      prevEl: `.swiper-button-prev-mobile-${business.id}`,
                      enabled: true
                    }}
                    pagination={{ 
                      clickable: true,
                      enabled: false 
                    }}
                    spaceBetween={0}
                    slidesPerView={1}
                    loop={true}
                    className="w-full h-[200px] product-carousel"
                  >
                    {business.product_images && business.product_images.length > 0 ? (
                      business.product_images.map((image, index) => (
                        <SwiperSlide key={index}>
                          <img
                            src={image}
                            alt={`${business.name} product ${index + 1}`}
                            className="w-full h-[200px] object-cover"
                          />
                        </SwiperSlide>
                      ))
                    ) : (
                      <SwiperSlide>
                        <img
                          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=320&h=200&fit=crop"
                          alt={`${business.name} products`}
                          className="w-full h-[200px] object-cover"
                        />
                      </SwiperSlide>
                    )}
                    
                    {/* Custom Navigation Arrows - only show if multiple images */}
                    {business.product_images && business.product_images.length > 1 && (
                      <>
                        <button 
                          className={`swiper-button-prev-mobile-${business.id} absolute left-2 top-1/2 -translate-y-1/2 z-30 w-6 h-6 bg-white/95 rounded-full flex items-center justify-center cursor-pointer hover:bg-white transition-all duration-200 shadow-lg border border-gray-200`}
                          type="button"
                        >
                          <ChevronLeft className="w-3 h-3 text-gray-800" />
                        </button>
                        <button 
                          className={`swiper-button-next-mobile-${business.id} absolute right-2 top-1/2 -translate-y-1/2 z-30 w-6 h-6 bg-white/95 rounded-full flex items-center justify-center cursor-pointer hover:bg-white transition-all duration-200 shadow-lg border border-gray-200`}
                          type="button"
                        >
                          <ChevronRight className="w-3 h-3 text-gray-800" />
                        </button>
                      </>
                    )}
                  </Swiper>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 px-1 py-2 h-auto w-6 bg-white/80 hover:bg-white z-40"
                  >
                    <Bookmark className="w-3 h-3 text-gray-600" />
                  </Button>
                </div>
                
                <CardContent className="flex-1 p-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {business.starting_price ? (
                          <span>
                            <span className="text-primary">From</span> {business.starting_price}
                          </span>
                        ) : 'Price on request'}
                      </div>
                      <div className="flex items-center gap-1">
                        {business.facebook_page && (
                          <div 
                            className="w-7 h-7 rounded-full border border-border shadow-md flex items-center justify-center bg-background hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => window.open(business.facebook_page, '_blank')}
                          >
                            <Facebook className="w-3 h-3 text-blue-600" />
                          </div>
                        )}
                        {business.tiktok_url && (
                          <div 
                            className="w-7 h-7 rounded-full border border-border shadow-md flex items-center justify-center bg-background hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => window.open(business.tiktok_url, '_blank')}
                          >
                            <Instagram className="w-3 h-3 text-pink-600" />
                          </div>
                        )}
                        {business.phone && (
                          <div 
                            className="w-7 h-7 rounded-full border border-border shadow-md flex items-center justify-center bg-background hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => window.open(`https://wa.me/${business.phone.replace(/[^\d]/g, '')}`, '_blank')}
                          >
                            <MessageCircle className="w-3 h-3 text-green-600" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <img 
                          src={business.image_url || "https://images.unsplash.com/photo-1592659762303-90081d34b277?w=40&h=40&fit=crop"} 
                          alt="Business logo" 
                          className="w-10 h-10 rounded-md object-cover border border-amber-700"
                        />
                        {isLicenseValid(business.license_expired_date) && (
                          <BadgeCheck className="w-4 h-4 text-white absolute -top-1 -right-1 rounded-full bg-primary" />
                        )}
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
                    
                    
                    {/* Business Options */}
                    {business.business_options && business.business_options.length > 0 && (
                      <div className="flex flex-wrap gap-x-1 gap-y-1">
                        {business.business_options.map((option, index) => (
                          <div key={index}>
                            <span className={`text-xs px-2 py-0.5 rounded border ${getOptionColors(index)}`}>
                              {option}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 mt-2">
                    <Dialog open={openModal === business.id} onOpenChange={(open) => setOpenModal(open ? business.id : null)}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full h-8 text-xs bg-[#F5F8FA] hover:bg-[#E8EEF2] border-border"
                        >
                          See Products Catalog
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{business.name} - Products Catalog</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                          {parseProductsCatalog(business.products_catalog).length > 0 ? (
                            parseProductsCatalog(business.products_catalog).map((product: string, index: number) => (
                              <div key={index} className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                                <Check className="w-4 h-4 text-primary" />
                                <span className="text-sm">{product}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <p>No products catalog available</p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    
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
                </SwiperSlide>
              ))}
              
              {/* Fixed seventh card - Discover more shops (Mobile) */}
              <SwiperSlide key="discover-more-mobile">
                <Card className="group w-full max-w-[320px] h-[455px] flex flex-col shadow-lg hover:shadow-2xl transition-all duration-300 mx-auto bg-gradient-to-br from-slate-800 to-slate-900">
                  <div className="relative overflow-hidden rounded-t-lg h-[200px] bg-gradient-to-br from-slate-700 to-slate-800">
                    <img
                      src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=320&h=200&fit=crop"
                      alt="Discover more shops"
                      className="w-full h-[200px] object-cover opacity-30"
                    />
                  </div>
                  
                  <CardContent className="flex-1 p-3 flex flex-col justify-center items-center text-center">
                    <div className="space-y-4">
                      <h3 className="text-white text-lg font-bold">
                        Discover more shops
                      </h3>
                      <p className="text-white/80 text-sm">
                        Explore hundreds of businesses and find exactly what you're looking for
                      </p>
                      <Button 
                        style={{ backgroundColor: '#EAB33A' }}
                        className="w-full h-10 text-black font-medium hover:opacity-90 transition-opacity"
                      >
                        Go Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </SwiperSlide>
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopularBusinesses;