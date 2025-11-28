import { Session, Speaker, UserProfile, Connection, Message, VenueInfo, VenueFloor, VenueRoom } from '@/types';

/**
 * Mock data for testing and development
 * Remove this file when connecting to real Appwrite data
 */

// Mock Speakers
export const mockSpeakers: Speaker[] = [
  {
    $id: 'speaker-1',
    $createdAt: '2024-11-01T00:00:00.000Z',
    $updatedAt: '2024-11-01T00:00:00.000Z',
    $permissions: [],
    name: 'Dr. Sarah Chen',
    title: 'Director of AI Research',
    organization: 'MIT Education Lab',
    bio: 'Leading researcher in AI applications for education with 15+ years of experience.',
    photo: 'https://i.pravatar.cc/150?img=1',
    expertise: ['AI in Education', 'Machine Learning', 'EdTech'],
    socialLinks: {
      twitter: 'https://twitter.com/sarahchen',
      linkedin: 'https://linkedin.com/in/sarahchen',
    },
    isFeatured: true,
    sortOrder: 1,
  },
  {
    $id: 'speaker-2',
    $createdAt: '2024-11-01T00:00:00.000Z',
    $updatedAt: '2024-11-01T00:00:00.000Z',
    $permissions: [],
    name: 'Prof. James Miller',
    title: 'Dean of Innovation',
    organization: 'Stanford University',
    bio: 'Pioneer in online learning platforms and educational technology.',
    photo: 'https://i.pravatar.cc/150?img=2',
    expertise: ['Online Learning', 'EdTech', 'Curriculum Design'],
    socialLinks: {
      twitter: 'https://twitter.com/jmiller',
    },
    isFeatured: true,
    sortOrder: 2,
  },
  {
    $id: 'speaker-3',
    $createdAt: '2024-11-01T00:00:00.000Z',
    $updatedAt: '2024-11-01T00:00:00.000Z',
    $permissions: [],
    name: 'Maya Rodriguez',
    title: 'Chief Learning Officer',
    organization: 'Google Education',
    bio: 'Expert in scaling education technology solutions globally.',
    photo: 'https://i.pravatar.cc/150?img=5',
    expertise: ['EdTech Strategy', 'Digital Learning', 'Product Design'],
    isFeatured: false,
    sortOrder: 3,
  },
];

// Mock Sessions
export const mockSessions: Session[] = [
  {
    $id: 'session-1',
    $createdAt: '2024-11-01T00:00:00.000Z',
    $updatedAt: '2024-11-01T00:00:00.000Z',
    $permissions: [],
    eventId: 'event-1',
    title: 'AI in Education: Future Trends and Opportunities',
    description: 'Explore the latest advancements in artificial intelligence and their transformative impact on education systems worldwide. Learn about practical applications, challenges, and the future of AI-powered learning.',
    type: 'keynote',
    track: 'Technology',
    startTime: '2024-12-01T14:00:00.000Z',
    endTime: '2024-12-01T15:30:00.000Z',
    room: 'Main Hall A',
    floor: 'Ground Floor',
    speakerIds: ['speaker-1'],
    capacity: 500,
    currentAttendees: 342,
    tags: ['AI', 'Future of Education', 'Technology'],
    isFeatured: true,
    status: 'scheduled',
  },
  {
    $id: 'session-2',
    $createdAt: '2024-11-01T00:00:00.000Z',
    $updatedAt: '2024-11-01T00:00:00.000Z',
    $permissions: [],
    eventId: 'event-1',
    title: 'Building Inclusive Digital Learning Environments',
    description: 'Discover strategies for creating accessible and inclusive online learning platforms that serve diverse student populations. Includes case studies and best practices.',
    type: 'panel',
    track: 'Accessibility',
    startTime: '2024-12-01T16:00:00.000Z',
    endTime: '2024-12-01T17:00:00.000Z',
    room: 'Conference Room B',
    floor: '1st Floor',
    speakerIds: ['speaker-2', 'speaker-3'],
    capacity: 150,
    currentAttendees: 87,
    tags: ['Accessibility', 'Inclusion', 'Digital Learning'],
    isFeatured: false,
    status: 'scheduled',
  },
  {
    $id: 'session-3',
    $createdAt: '2024-11-01T00:00:00.000Z',
    $updatedAt: '2024-11-01T00:00:00.000Z',
    $permissions: [],
    eventId: 'event-1',
    title: 'Hands-on Workshop: Designing Interactive Learning Modules',
    description: 'A practical workshop where participants will learn to design and build interactive learning modules using modern tools and frameworks. Bring your laptop!',
    type: 'workshop',
    track: 'Curriculum Design',
    startTime: '2024-12-02T09:00:00.000Z',
    endTime: '2024-12-02T12:00:00.000Z',
    room: 'Workshop Lab 1',
    floor: '2nd Floor',
    speakerIds: ['speaker-3'],
    capacity: 50,
    currentAttendees: 48,
    tags: ['Workshop', 'Hands-on', 'Curriculum'],
    isFeatured: true,
    status: 'scheduled',
  },
  {
    $id: 'session-4',
    $createdAt: '2024-11-01T00:00:00.000Z',
    $updatedAt: '2024-11-01T00:00:00.000Z',
    $permissions: [],
    eventId: 'event-1',
    title: 'Networking Lunch: EdTech Founders Meetup',
    description: 'Informal networking session for EdTech founders and entrepreneurs. Share experiences, challenges, and opportunities in the education technology space.',
    type: 'networking',
    track: 'Networking',
    startTime: '2024-12-02T12:00:00.000Z',
    endTime: '2024-12-02T13:30:00.000Z',
    room: 'Garden Terrace',
    floor: 'Ground Floor',
    capacity: 100,
    currentAttendees: 23,
    tags: ['Networking', 'Founders', 'EdTech'],
    isFeatured: false,
    status: 'scheduled',
  },
  {
    $id: 'session-5',
    $createdAt: '2024-11-01T00:00:00.000Z',
    $updatedAt: '2024-11-01T00:00:00.000Z',
    $permissions: [],
    eventId: 'event-1',
    title: 'Data-Driven Decision Making in Education',
    description: 'Learn how to leverage data analytics and insights to improve student outcomes and institutional effectiveness.',
    type: 'breakout',
    track: 'Data & Analytics',
    startTime: '2024-12-02T14:00:00.000Z',
    endTime: '2024-12-02T15:00:00.000Z',
    room: 'Room C3',
    floor: '3rd Floor',
    speakerIds: ['speaker-1', 'speaker-2'],
    capacity: 80,
    currentAttendees: 56,
    tags: ['Data Analytics', 'Student Success', 'Metrics'],
    isFeatured: false,
    status: 'scheduled',
  },
  {
    $id: 'session-6',
    $createdAt: '2024-11-01T00:00:00.000Z',
    $updatedAt: '2024-11-01T00:00:00.000Z',
    $permissions: [],
    eventId: 'event-1',
    title: 'The Future of Credentialing and Micro-credentials',
    description: 'Exploring alternative credentialing pathways and the role of micro-credentials in the future of work and education.',
    type: 'panel',
    track: 'Future of Work',
    startTime: '2024-12-03T10:00:00.000Z',
    endTime: '2024-12-03T11:30:00.000Z',
    room: 'Main Hall B',
    floor: 'Ground Floor',
    speakerIds: ['speaker-2'],
    capacity: 300,
    currentAttendees: 145,
    tags: ['Credentials', 'Future of Work', 'Skills'],
    isFeatured: true,
    status: 'scheduled',
  },
];

// Helper function to get speaker by ID
export function getSpeakerById(id: string): Speaker | undefined {
  return mockSpeakers.find((speaker) => speaker.$id === id);
}

// Helper function to get session by ID
export function getSessionById(id: string): Session | undefined {
  return mockSessions.find((session) => session.$id === id);
}

// Helper function to get speakers for a session
export function getSpeakersForSession(session: Session): Speaker[] {
  if (!session.speakerIds) return [];
  return session.speakerIds
    .map((id) => getSpeakerById(id))
    .filter((speaker): speaker is Speaker => speaker !== undefined);
}

// Helper function to filter sessions
export function filterSessions(
  sessions: Session[],
  filters: {
    type?: string;
    track?: string;
    date?: string;
    searchQuery?: string;
  }
): Session[] {
  let filtered = [...sessions];

  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter((s) => s.type === filters.type);
  }

  if (filters.track && filters.track !== 'all') {
    filtered = filtered.filter((s) => s.track === filters.track);
  }

  if (filters.date) {
    filtered = filtered.filter((s) => {
      const sessionDate = new Date(s.startTime).toDateString();
      return sessionDate === new Date(filters.date!).toDateString();
    });
  }

  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query) ||
        s.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  }

  return filtered;
}

// Get unique session types
export function getSessionTypes(): string[] {
  const types = new Set(mockSessions.map((s) => s.type));
  return Array.from(types);
}

// Get unique tracks
export function getSessionTracks(): string[] {
  const tracks = new Set(mockSessions.map((s) => s.track).filter((t): t is string => !!t));
  return Array.from(tracks);
}

// Get unique dates
export function getSessionDates(): string[] {
  const dates = new Set(
    mockSessions.map((s) => new Date(s.startTime).toDateString())
  );
  return Array.from(dates);
}

// =============================================================================
// NETWORKING: Mock Attendees
// =============================================================================

export const mockAttendees: UserProfile[] = [
  {
    $id: 'user-1',
    $createdAt: '2024-11-01T00:00:00.000Z',
    $updatedAt: '2024-11-01T00:00:00.000Z',
    $permissions: [],
    clerkUserId: 'clerk-user-1',
    email: 'alex.johnson@gmail.com',
    fullName: 'Alex Johnson',
    avatar: 'https://i.pravatar.cc/150?img=10',
    title: 'Product Manager',
    organization: 'EdTech Innovations',
    bio: 'Passionate about building educational technology products that make a difference. 10+ years in product management.',
    interests: ['EdTech', 'Product Design', 'User Research', 'AI in Education'],
    socialLinks: {
      twitter: 'https://twitter.com/alexj',
      linkedin: 'https://linkedin.com/in/alexjohnson',
    },
    role: 'attendee',
    isPublic: true,
    points: 150,
    badges: ['Early Bird', 'Networker'],
  },
  {
    $id: 'user-2',
    $createdAt: '2024-11-01T00:00:00.000Z',
    $updatedAt: '2024-11-01T00:00:00.000Z',
    $permissions: [],
    clerkUserId: 'clerk-user-2',
    email: 'priya.patel@university.edu',
    fullName: 'Priya Patel',
    avatar: 'https://i.pravatar.cc/150?img=20',
    title: 'Assistant Professor',
    organization: 'University of California',
    bio: 'Researcher focused on online learning effectiveness and student engagement.',
    interests: ['Online Learning', 'Research', 'Higher Education', 'Learning Analytics'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/priyapatel',
      website: 'https://priyapatel.edu',
    },
    role: 'attendee',
    isPublic: true,
    points: 250,
    badges: ['Scholar', 'Session Host'],
  },
  {
    $id: 'user-3',
    $createdAt: '2024-11-01T00:00:00.000Z',
    $updatedAt: '2024-11-01T00:00:00.000Z',
    $permissions: [],
    clerkUserId: 'clerk-user-3',
    email: 'mark.wilson@startup.io',
    fullName: 'Mark Wilson',
    avatar: 'https://i.pravatar.cc/150?img=30',
    title: 'Founder & CEO',
    organization: 'LearnFast Startup',
    bio: 'Building the next generation of adaptive learning platforms. Y Combinator W22.',
    interests: ['Startups', 'EdTech', 'AI', 'Venture Capital'],
    socialLinks: {
      twitter: 'https://twitter.com/markw',
      linkedin: 'https://linkedin.com/in/markwilson',
    },
    role: 'attendee',
    isPublic: true,
    points: 180,
    badges: ['Founder', 'Innovator'],
  },
  {
    $id: 'user-4',
    $createdAt: '2024-11-01T00:00:00.000Z',
    $updatedAt: '2024-11-01T00:00:00.000Z',
    $permissions: [],
    clerkUserId: 'clerk-user-4',
    email: 'sofia.martinez@school.org',
    fullName: 'Sofia Martinez',
    avatar: 'https://i.pravatar.cc/150?img=40',
    title: 'Technology Director',
    organization: 'International School Network',
    bio: 'Leading digital transformation in K-12 education across 50+ schools.',
    interests: ['K-12 Education', 'Digital Transformation', 'Teacher Training'],
    role: 'attendee',
    isPublic: true,
    points: 120,
  },
  {
    $id: 'user-5',
    $createdAt: '2024-11-01T00:00:00.000Z',
    $updatedAt: '2024-11-01T00:00:00.000Z',
    $permissions: [],
    clerkUserId: 'clerk-user-5',
    email: 'david.lee@nonprofit.org',
    fullName: 'David Lee',
    avatar: 'https://i.pravatar.cc/150?img=50',
    title: 'Program Director',
    organization: 'Education for All Foundation',
    bio: 'Working to bring quality education to underserved communities worldwide.',
    interests: ['Social Impact', 'Accessibility', 'Global Education'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/davidlee',
    },
    role: 'attendee',
    isPublic: true,
    points: 200,
    badges: ['Impact Champion'],
  },
  {
    $id: 'user-6',
    $createdAt: '2024-11-01T00:00:00.000Z',
    $updatedAt: '2024-11-01T00:00:00.000Z',
    $permissions: [],
    clerkUserId: 'clerk-user-6',
    email: 'emma.brown@company.com',
    fullName: 'Emma Brown',
    avatar: 'https://i.pravatar.cc/150?img=60',
    title: 'Learning & Development Manager',
    organization: 'Tech Corp',
    bio: 'Designing corporate learning programs that drive employee growth and retention.',
    interests: ['Corporate Learning', 'Leadership Development', 'LMS'],
    role: 'attendee',
    isPublic: true,
    points: 90,
  },
];

// Mock Connections
export const mockConnections: Connection[] = [
  {
    $id: 'conn-1',
    $createdAt: '2024-11-20T00:00:00.000Z',
    $updatedAt: '2024-11-20T00:00:00.000Z',
    $permissions: [],
    requesterId: 'clerk-user-1',
    recipientId: 'clerk-user-2',
    status: 'accepted',
    message: 'Hi Priya! Would love to connect and discuss online learning research.',
  },
  {
    $id: 'conn-2',
    $createdAt: '2024-11-21T00:00:00.000Z',
    $updatedAt: '2024-11-21T00:00:00.000Z',
    $permissions: [],
    requesterId: 'clerk-user-3',
    recipientId: 'clerk-user-1',
    status: 'pending',
    message: 'Hey Alex! Saw your work in EdTech. Let\'s chat!',
  },
  {
    $id: 'conn-3',
    $createdAt: '2024-11-22T00:00:00.000Z',
    $updatedAt: '2024-11-22T00:00:00.000Z',
    $permissions: [],
    requesterId: 'clerk-user-1',
    recipientId: 'clerk-user-4',
    status: 'accepted',
    message: 'Hi Sofia! Interested in your digital transformation work.',
  },
];

// Helper Functions for Networking

// Get attendee by ID
export function getAttendeeById(id: string): UserProfile | undefined {
  return mockAttendees.find((attendee) => attendee.$id === id || attendee.clerkUserId === id);
}

// Get attendee by Clerk User ID
export function getAttendeeByClerkId(clerkUserId: string): UserProfile | undefined {
  return mockAttendees.find((attendee) => attendee.clerkUserId === clerkUserId);
}

// Search attendees
export function searchAttendees(query: string): UserProfile[] {
  if (!query) return mockAttendees;

  const lowerQuery = query.toLowerCase();
  return mockAttendees.filter(
    (attendee) =>
      attendee.fullName.toLowerCase().includes(lowerQuery) ||
      attendee.organization?.toLowerCase().includes(lowerQuery) ||
      attendee.title?.toLowerCase().includes(lowerQuery) ||
      attendee.interests?.some((interest) => interest.toLowerCase().includes(lowerQuery))
  );
}

// Get connections for a user
export function getUserConnections(clerkUserId: string): Connection[] {
  return mockConnections.filter(
    (conn) =>
      (conn.requesterId === clerkUserId || conn.recipientId === clerkUserId) &&
      conn.status === 'accepted'
  );
}

// Get pending connection requests for a user
export function getPendingRequests(clerkUserId: string): Connection[] {
  return mockConnections.filter(
    (conn) => conn.recipientId === clerkUserId && conn.status === 'pending'
  );
}

// Get sent connection requests
export function getSentRequests(clerkUserId: string): Connection[] {
  return mockConnections.filter(
    (conn) => conn.requesterId === clerkUserId && conn.status === 'pending'
  );
}

// Check if two users are connected
export function areUsersConnected(userId1: string, userId2: string): boolean {
  return mockConnections.some(
    (conn) =>
      ((conn.requesterId === userId1 && conn.recipientId === userId2) ||
        (conn.requesterId === userId2 && conn.recipientId === userId1)) &&
      conn.status === 'accepted'
  );
}

// Check if connection request exists
export function hasConnectionRequest(userId1: string, userId2: string): Connection | undefined {
  return mockConnections.find(
    (conn) =>
      (conn.requesterId === userId1 && conn.recipientId === userId2) ||
      (conn.requesterId === userId2 && conn.recipientId === userId1)
  );
}

// =============================================================================
// VENUE: Mock Venue & Floor Plan Data
// =============================================================================

export const mockVenue: VenueInfo = {
  name: 'WISE Convention Center',
  address: '123 Education Boulevard, Innovation District, San Francisco, CA 94105',
  coordinates: {
    latitude: 37.7749,
    longitude: -122.4194,
  },
  parking: {
    available: true,
    type: 'Underground & Street',
    description: 'Underground parking available on levels B1-B3. Street parking on Education Blvd and Innovation Ave.',
  },
  transit: [
    'BART: Montgomery Station (10 min walk)',
    'Muni: Lines 10, 12, 30, 45',
    'Caltrain: 4th & King (15 min walk)',
  ],
  amenities: [
    'Free Wi-Fi',
    'Wheelchair Accessible',
    'Nursing Room',
    'Prayer Room',
    'Coat Check',
    'Charging Stations',
    'Food Court',
    'Coffee Bars',
  ],
  wifi: {
    network: 'WISE-Event-2024',
    password: 'education2024',
  },
  emergencyInfo: {
    exits: ['Main Entrance (Ground Floor)', 'East Exit (All Floors)', 'West Exit (All Floors)'],
    meetingPoint: 'Front Plaza by the Fountain',
    contact: '+1-555-WISE-911',
  },
  floors: [],
};

// Ground Floor Rooms
const groundFloorRooms: VenueRoom[] = [
  {
    id: 'ground-main-hall-a',
    name: 'Main Hall A',
    floor: 'Ground Floor',
    capacity: 500,
    type: 'main-hall',
    coordinates: { x: 30, y: 40 },
    amenities: ['Stage', 'Audio/Visual', 'Live Streaming', 'Wheelchair Access'],
    description: 'Primary keynote and plenary hall with state-of-the-art AV equipment.',
  },
  {
    id: 'ground-main-hall-b',
    name: 'Main Hall B',
    floor: 'Ground Floor',
    capacity: 300,
    type: 'main-hall',
    coordinates: { x: 70, y: 40 },
    amenities: ['Stage', 'Audio/Visual', 'Live Streaming'],
    description: 'Secondary hall for large sessions and panels.',
  },
  {
    id: 'ground-registration',
    name: 'Registration Lobby',
    floor: 'Ground Floor',
    capacity: 100,
    type: 'networking',
    coordinates: { x: 50, y: 80 },
    amenities: ['Information Desk', 'Charging Stations', 'Seating Area'],
    description: 'Main registration and information area.',
  },
  {
    id: 'ground-exhibition',
    name: 'Exhibition Hall',
    floor: 'Ground Floor',
    capacity: 200,
    type: 'exhibition',
    coordinates: { x: 50, y: 20 },
    amenities: ['Booth Spaces', 'Demo Areas', 'Charging Stations'],
    description: 'Sponsor and exhibitor showcase area.',
  },
  {
    id: 'ground-garden-terrace',
    name: 'Garden Terrace',
    floor: 'Ground Floor',
    capacity: 100,
    type: 'networking',
    coordinates: { x: 15, y: 70 },
    amenities: ['Outdoor Seating', 'Refreshments', 'Wi-Fi'],
    description: 'Outdoor networking and lunch space.',
  },
];

// First Floor Rooms
const firstFloorRooms: VenueRoom[] = [
  {
    id: '1f-conference-b',
    name: 'Conference Room B',
    floor: '1st Floor',
    capacity: 150,
    type: 'conference',
    coordinates: { x: 35, y: 45 },
    amenities: ['Projector', 'Whiteboard', 'Video Conferencing'],
    description: 'Medium-sized conference room for panels and discussions.',
  },
  {
    id: '1f-workshop-lab-1',
    name: 'Workshop Lab 1',
    floor: '1st Floor',
    capacity: 50,
    type: 'workshop',
    coordinates: { x: 65, y: 45 },
    amenities: ['Workstations', 'Projector', 'Whiteboards', 'Power Outlets'],
    description: 'Hands-on workshop space with equipment.',
  },
  {
    id: '1f-breakout-1',
    name: 'Breakout Room 1',
    floor: '1st Floor',
    capacity: 30,
    type: 'breakout',
    coordinates: { x: 20, y: 60 },
    amenities: ['TV Screen', 'Whiteboard', 'Comfortable Seating'],
    description: 'Small group discussions and meetings.',
  },
  {
    id: '1f-breakout-2',
    name: 'Breakout Room 2',
    floor: '1st Floor',
    capacity: 30,
    type: 'breakout',
    coordinates: { x: 80, y: 60 },
    amenities: ['TV Screen', 'Whiteboard', 'Comfortable Seating'],
    description: 'Small group discussions and meetings.',
  },
  {
    id: '1f-networking-lounge',
    name: 'Networking Lounge',
    floor: '1st Floor',
    capacity: 80,
    type: 'networking',
    coordinates: { x: 50, y: 25 },
    amenities: ['Soft Seating', 'Coffee Bar', 'Charging Stations'],
    description: 'Casual networking and break area.',
  },
];

// Second Floor Rooms
const secondFloorRooms: VenueRoom[] = [
  {
    id: '2f-workshop-lab-2',
    name: 'Workshop Lab 2',
    floor: '2nd Floor',
    capacity: 50,
    type: 'workshop',
    coordinates: { x: 40, y: 50 },
    amenities: ['Workstations', 'Projector', 'Whiteboards'],
    description: 'Hands-on workshop space.',
  },
  {
    id: '2f-room-c3',
    name: 'Room C3',
    floor: '2nd Floor',
    capacity: 80,
    type: 'conference',
    coordinates: { x: 60, y: 50 },
    amenities: ['Projector', 'Audio System', 'Whiteboard'],
    description: 'Conference room for medium sessions.',
  },
  {
    id: '2f-breakout-3',
    name: 'Breakout Room 3',
    floor: '2nd Floor',
    capacity: 25,
    type: 'breakout',
    coordinates: { x: 25, y: 35 },
    amenities: ['TV Screen', 'Whiteboard'],
    description: 'Small group space.',
  },
  {
    id: '2f-breakout-4',
    name: 'Breakout Room 4',
    floor: '2nd Floor',
    capacity: 25,
    type: 'breakout',
    coordinates: { x: 75, y: 35 },
    amenities: ['TV Screen', 'Whiteboard'],
    description: 'Small group space.',
  },
  {
    id: '2f-quiet-room',
    name: 'Quiet Room',
    floor: '2nd Floor',
    capacity: 15,
    type: 'breakout',
    coordinates: { x: 50, y: 70 },
    amenities: ['Soft Lighting', 'Comfortable Seating'],
    description: 'Quiet space for focus and relaxation.',
  },
];

// Third Floor Rooms
const thirdFloorRooms: VenueRoom[] = [
  {
    id: '3f-vip-lounge',
    name: 'VIP Lounge',
    floor: '3rd Floor',
    capacity: 50,
    type: 'networking',
    coordinates: { x: 50, y: 40 },
    amenities: ['Premium Seating', 'Refreshments', 'Private Terrace'],
    description: 'Exclusive lounge for VIP attendees and speakers.',
  },
  {
    id: '3f-speaker-prep',
    name: 'Speaker Prep Room',
    floor: '3rd Floor',
    capacity: 20,
    type: 'breakout',
    coordinates: { x: 30, y: 60 },
    amenities: ['Mirrors', 'Audio Check', 'Monitors'],
    description: 'Speaker preparation and rehearsal space.',
  },
  {
    id: '3f-media-room',
    name: 'Media Room',
    floor: '3rd Floor',
    capacity: 30,
    type: 'conference',
    coordinates: { x: 70, y: 60 },
    amenities: ['Recording Equipment', 'Editing Stations'],
    description: 'Press and media operations center.',
  },
];

// Assemble floors
const mockFloors: VenueFloor[] = [
  {
    id: 'ground',
    name: 'Ground Floor',
    level: 0,
    rooms: groundFloorRooms,
  },
  {
    id: 'first',
    name: '1st Floor',
    level: 1,
    rooms: firstFloorRooms,
  },
  {
    id: 'second',
    name: '2nd Floor',
    level: 2,
    rooms: secondFloorRooms,
  },
  {
    id: 'third',
    name: '3rd Floor',
    level: 3,
    rooms: thirdFloorRooms,
  },
];

// Update venue with floors
mockVenue.floors = mockFloors;

// Helper Functions for Venue

// Get all rooms across all floors
export function getAllRooms(): VenueRoom[] {
  return mockVenue.floors.flatMap((floor) => floor.rooms);
}

// Get room by ID
export function getRoomById(id: string): VenueRoom | undefined {
  return getAllRooms().find((room) => room.id === id);
}

// Get room by name
export function getRoomByName(name: string): VenueRoom | undefined {
  return getAllRooms().find((room) => room.name === name);
}

// Get rooms by floor
export function getRoomsByFloor(floorId: string): VenueRoom[] {
  const floor = mockVenue.floors.find((f) => f.id === floorId);
  return floor ? floor.rooms : [];
}

// Get floor by room
export function getFloorByRoom(roomId: string): VenueFloor | undefined {
  return mockVenue.floors.find((floor) => floor.rooms.some((room) => room.id === roomId));
}

// Search rooms
export function searchRooms(query: string): VenueRoom[] {
  if (!query) return getAllRooms();

  const lowerQuery = query.toLowerCase();
  return getAllRooms().filter(
    (room) =>
      room.name.toLowerCase().includes(lowerQuery) ||
      room.floor.toLowerCase().includes(lowerQuery) ||
      room.type.toLowerCase().includes(lowerQuery)
  );
}
