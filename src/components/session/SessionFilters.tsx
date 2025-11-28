import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Searchbar, Chip, Text, Menu, Button } from 'react-native-paper';
import { getSessionTypes, getSessionTracks, getSessionDates } from '@/lib/mockData';
import { format } from 'date-fns';

interface SessionFiltersProps {
  onFilterChange: (filters: {
    type?: string;
    track?: string;
    date?: string;
    searchQuery?: string;
  }) => void;
}

/**
 * Session Filters Component
 * Provides filtering options for sessions
 */
export function SessionFilters({ onFilterChange }: SessionFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);
  const [trackMenuVisible, setTrackMenuVisible] = useState(false);

  const types = getSessionTypes();
  const tracks = getSessionTracks();
  const dates = getSessionDates();

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onFilterChange({
      type: selectedType,
      track: selectedTrack,
      date: selectedDate,
      searchQuery: query,
    });
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setTypeMenuVisible(false);
    onFilterChange({
      type,
      track: selectedTrack,
      date: selectedDate,
      searchQuery,
    });
  };

  const handleTrackChange = (track: string) => {
    setSelectedTrack(track);
    setTrackMenuVisible(false);
    onFilterChange({
      type: selectedType,
      track,
      date: selectedDate,
      searchQuery,
    });
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    onFilterChange({
      type: selectedType,
      track: selectedTrack,
      date,
      searchQuery,
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedTrack('all');
    setSelectedDate('all');
    onFilterChange({});
  };

  const hasActiveFilters =
    selectedType !== 'all' ||
    selectedTrack !== 'all' ||
    selectedDate !== 'all' ||
    searchQuery !== '';

  return (
    <View className="bg-white pb-2">
      {/* Search Bar */}
      <View className="px-4 pt-2">
        <Searchbar
          placeholder="Search sessions..."
          onChangeText={handleSearchChange}
          value={searchQuery}
          style={{ elevation: 0, backgroundColor: '#f3f4f6' }}
        />
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 pt-3"
        contentContainerStyle={{ gap: 8 }}
      >
        {/* Type Filter */}
        <Menu
          visible={typeMenuVisible}
          onDismiss={() => setTypeMenuVisible(false)}
          anchor={
            <Chip
              mode={selectedType !== 'all' ? 'flat' : 'outlined'}
              selected={selectedType !== 'all'}
              onPress={() => setTypeMenuVisible(true)}
              icon="shape"
            >
              {selectedType === 'all' ? 'Type' : selectedType}
            </Chip>
          }
        >
          <Menu.Item onPress={() => handleTypeChange('all')} title="All Types" />
          {types.map((type) => (
            <Menu.Item
              key={type}
              onPress={() => handleTypeChange(type)}
              title={type.charAt(0).toUpperCase() + type.slice(1)}
            />
          ))}
        </Menu>

        {/* Track Filter */}
        <Menu
          visible={trackMenuVisible}
          onDismiss={() => setTrackMenuVisible(false)}
          anchor={
            <Chip
              mode={selectedTrack !== 'all' ? 'flat' : 'outlined'}
              selected={selectedTrack !== 'all'}
              onPress={() => setTrackMenuVisible(true)}
              icon="bookmark"
            >
              {selectedTrack === 'all' ? 'Track' : selectedTrack}
            </Chip>
          }
        >
          <Menu.Item onPress={() => handleTrackChange('all')} title="All Tracks" />
          {tracks.map((track) => (
            <Menu.Item
              key={track}
              onPress={() => handleTrackChange(track)}
              title={track}
            />
          ))}
        </Menu>

        {/* Date Filter - Chips */}
        <Chip
          mode={selectedDate === 'all' ? 'outlined' : 'flat'}
          selected={selectedDate === 'all'}
          onPress={() => handleDateChange('all')}
        >
          All Days
        </Chip>
        {dates.map((date) => (
          <Chip
            key={date}
            mode={selectedDate === date ? 'flat' : 'outlined'}
            selected={selectedDate === date}
            onPress={() => handleDateChange(date)}
          >
            {format(new Date(date), 'MMM dd')}
          </Chip>
        ))}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Chip icon="close" onPress={clearFilters}>
            Clear
          </Chip>
        )}
      </ScrollView>
    </View>
  );
}
