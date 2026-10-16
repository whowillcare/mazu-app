'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MajorCity, MAJOR_CITIES, searchCities, findNearestCity, formatLongitude } from '@/lib/geo/cities';

export interface CityLocationPickerProps {
  language: 'en' | 'zh-TW';
  selectedCity: MajorCity;
  onCityChange: (city: MajorCity) => void;
  className?: string;
}

export const CityLocationPicker: React.FC<CityLocationPickerProps> = ({
  language,
  selectedCity,
  onCityChange,
  className = '',
}) => {
  const [userQuery, setUserQuery] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<MajorCity[]>(MAJOR_CITIES.slice(0, 8));
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locatedSuccess, setLocatedSuccess] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedDisplay =
    language === 'zh-TW'
      ? `${selectedCity.nameZh} (${formatLongitude(selectedCity.longitude)})`
      : `${selectedCity.nameEn} (${formatLongitude(selectedCity.longitude)})`;
  const query = userQuery !== null ? userQuery : selectedDisplay;

  // Handle typing search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserQuery(val);
    setIsOpen(true);
    setLocationError(null);
    setLocatedSuccess(false);

    if (val.trim().length > 0) {
      setResults(searchCities(val, 8));
    } else {
      setResults(MAJOR_CITIES.slice(0, 8));
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Request browser geolocation permission & auto-locate
  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(
        language === 'zh-TW'
          ? '您的瀏覽器不支援地理定位功能，請在下方清單搜尋城市。'
          : 'Geolocation is not supported by your browser. Please search your city below.'
      );
      return;
    }

    setIsLocating(true);
    setLocationError(null);
    setLocatedSuccess(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        const nearest = findNearestCity(latitude, longitude);

        // Calculate local browser timezone offset
        const browserOffsetHours = -Math.round(new Date().getTimezoneOffset() / 60);

        const customLocatedCity: MajorCity = {
          ...nearest,
          id: `gps-custom`,
          nameEn: `${nearest.nameEn} (GPS)`,
          nameZh: `${nearest.nameZh} (GPS定位)`,
          latitude: Number(latitude.toFixed(4)),
          longitude: Number(longitude.toFixed(4)),
          timeZoneOffset: browserOffsetHours,
        };

        setUserQuery(null);
        onCityChange(customLocatedCity);
        setLocatedSuccess(true);
        setIsOpen(false);
      },
      (err) => {
        setIsLocating(false);
        let msg = language === 'zh-TW' ? '無法獲取位置授權。請直接在下方搜尋選擇出生城市。' : 'Location permission denied or timed out. Please select your city below.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = language === 'zh-TW' ? '定位權限已被拒絕。請手動輸入搜尋城市。' : 'Location access denied. Please type and search your city.';
        }
        setLocationError(msg);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSelectCity = (city: MajorCity) => {
    setUserQuery(null);
    onCityChange(city);
    setIsOpen(false);
    setLocatedSuccess(false);
  };

  return (
    <div ref={dropdownRef} className={`city-location-picker ${className}`} style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {language === 'zh-TW' ? '出生城市 / 經度 (真太陽時)' : 'Birth City / Longitude'}
        </label>
        <button
          type="button"
          onClick={handleRequestLocation}
          disabled={isLocating}
          title={language === 'zh-TW' ? '點擊請求 GPS 定位以自動校準' : 'Request GPS permission to auto-detect'}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--gold-primary)',
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            textDecoration: 'underline',
            padding: 0,
          }}
        >
          <span>📍</span>
          <span>{isLocating ? (language === 'zh-TW' ? '定位中...' : 'Locating...') : (language === 'zh-TW' ? '獲取當前定位' : 'Current Location')}</span>
        </button>
      </div>

      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={language === 'zh-TW' ? '輸入或搜尋城市，如：臺北、北京、紐約...' : 'Search city, e.g. Taipei, London, New York...'}
          style={{
            width: '100%',
            background: 'rgba(7, 11, 17, 0.85)',
            border: locatedSuccess ? '1px solid #48BB78' : '1px solid var(--border-gold)',
            borderRadius: '8px',
            padding: '10px 14px',
            color: 'var(--text-primary)',
            fontSize: '0.92rem',
            outline: 'none',
          }}
        />

        {locatedSuccess && (
          <span
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#48BB78',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
          >
            ✓
          </span>
        )}
      </div>

      {locationError && (
        <div style={{ color: '#E87A68', fontSize: '0.76rem', marginTop: '4px', lineHeight: 1.4 }}>
          {locationError}
        </div>
      )}

      {/* Autocomplete Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 120,
            background: '#0D1420',
            border: '1px solid var(--gold-primary)',
            borderRadius: '8px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.75)',
            maxHeight: '260px',
            overflowY: 'auto',
          }}
        >
          <div style={{ padding: '8px 12px', fontSize: '0.75rem', color: 'var(--text-muted)', borderBottom: '1px solid rgba(212, 175, 55, 0.15)' }}>
            {language === 'zh-TW' ? '選擇或搜尋全球出生城市 (自動校準真太陽時經度)：' : 'Select city to calibrate True Solar Time:'}
          </div>

          {results.length > 0 ? (
            results.map((c) => (
              <div
                key={c.id}
                onClick={() => handleSelectCity(c)}
                style={{
                  padding: '9px 12px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.86rem',
                  color: selectedCity.id === c.id ? 'var(--gold-primary)' : 'var(--text-primary)',
                  background: selectedCity.id === c.id ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(212, 175, 55, 0.15)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = selectedCity.id === c.id ? 'rgba(212, 175, 55, 0.12)' : 'transparent';
                }}
              >
                <div>
                  <span style={{ fontWeight: 600 }}>{language === 'zh-TW' ? c.nameZh : c.nameEn}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginLeft: '6px' }}>
                    ({language === 'zh-TW' ? c.countryZh : c.countryEn})
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--gold-light)', fontFamily: 'monospace' }}>
                  {formatLongitude(c.longitude)} (UTC{c.timeZoneOffset >= 0 ? '+' : ''}{c.timeZoneOffset})
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '12px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {language === 'zh-TW' ? '未找到該城市，可保留輸入並由系統就近匹配。' : 'No exact city found. Type closest hub or coordinates.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
