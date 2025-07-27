// Mock data for videos
export const mockVideos = [
  {
    id: '1',
    username: 'dance_star',
    userImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    caption: 'Check out this new dance routine! #dance #trending',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-dancing-happily-in-a-field-of-flowers-4702-large.mp4',
    audioTitle: 'Popular Dance Track - DJ Mix',
    likes: 1245,
    comments: 89,
    shares: 45,
    tags: ['dance', 'trending', 'summer'],
    isFollowing: false
  },
  {
    id: '2',
    username: 'travel_addict',
    userImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    caption: 'Beautiful sunset in Bali 🌅 #travel #bali #sunset',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-beach-landscape-from-the-top-of-a-cliff-4061-large.mp4',
    audioTitle: 'Chill Vibes - Summer Mix',
    likes: 2341,
    comments: 156,
    shares: 78,
    tags: ['travel', 'bali', 'sunset', 'vacation'],
    isFollowing: true
  },
  {
    id: '3',
    username: 'food_lover',
    userImage: 'https://randomuser.me/api/portraits/women/65.jpg',
    caption: 'Making my favorite pasta recipe! 🍝 #food #cooking #recipe',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cooking-with-a-pan-on-a-stove-2753-large.mp4',
    audioTitle: 'Cooking Time - Kitchen Beats',
    likes: 876,
    comments: 42,
    shares: 23,
    tags: ['food', 'cooking', 'recipe', 'pasta'],
    isFollowing: false
  },
  {
    id: '4',
    username: 'fitness_guru',
    userImage: 'https://randomuser.me/api/portraits/men/67.jpg',
    caption: 'Morning workout routine 💪 #fitness #workout #motivation',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-exercising-at-home-1456-large.mp4',
    audioTitle: 'Workout Motivation - Fitness Mix',
    likes: 3452,
    comments: 213,
    shares: 98,
    tags: ['fitness', 'workout', 'motivation', 'health'],
    isFollowing: true
  },
  {
    id: '5',
    username: 'pet_lover',
    userImage: 'https://randomuser.me/api/portraits/women/22.jpg',
    caption: 'My cat being adorable as always 😻 #cats #pets #cute',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-playful-cat-in-the-living-room-1538-large.mp4',
    audioTitle: 'Cute Pet Sounds - Original',
    likes: 5678,
    comments: 321,
    shares: 145,
    tags: ['cats', 'pets', 'cute', 'animals'],
    isFollowing: false
  },
  {
    id: '6',
    username: 'comedy_king',
    userImage: 'https://randomuser.me/api/portraits/men/85.jpg',
    caption: 'When you try to be cool but fail miserably 😂 #comedy #funny #fail',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-dancing-under-changing-lights-1240-large.mp4',
    audioTitle: 'Funny Sound Effect - Comedy Mix',
    likes: 9876,
    comments: 543,
    shares: 321,
    tags: ['comedy', 'funny', 'fail', 'lol'],
    isFollowing: true
  },
  {
    id: '7',
    username: 'music_lover',
    userImage: 'https://randomuser.me/api/portraits/women/33.jpg',
    caption: 'Playing my favorite song on guitar 🎸 #music #guitar #cover',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-playing-the-guitar-1539-large.mp4',
    audioTitle: 'Guitar Cover - Acoustic Session',
    likes: 4321,
    comments: 234,
    shares: 87,
    tags: ['music', 'guitar', 'cover', 'acoustic'],
    isFollowing: false
  },
  {
    id: '8',
    username: 'art_creator',
    userImage: 'https://randomuser.me/api/portraits/men/42.jpg',
    caption: 'Creating a new painting 🎨 #art #painting #creative',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-person-painting-a-picture-1665-large.mp4',
    audioTitle: 'Creative Inspiration - Art Mix',
    likes: 3456,
    comments: 178,
    shares: 65,
    tags: ['art', 'painting', 'creative', 'artist'],
    isFollowing: false
  },
  {
    id: '9',
    username: 'fashion_icon',
    userImage: 'https://randomuser.me/api/portraits/women/91.jpg',
    caption: 'OOTD for summer vibes 👗 #fashion #style #summer',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-modeling-for-a-clothing-store-1439-large.mp4',
    audioTitle: 'Fashion Week - Runway Mix',
    likes: 7654,
    comments: 432,
    shares: 210,
    tags: ['fashion', 'style', 'summer', 'ootd'],
    isFollowing: true
  },
  {
    id: '10',
    username: 'tech_geek',
    userImage: 'https://randomuser.me/api/portraits/men/29.jpg',
    caption: 'Unboxing the latest smartphone 📱 #tech #unboxing #gadgets',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-308-large.mp4',
    audioTitle: 'Tech Review - Gadget Mix',
    likes: 5432,
    comments: 321,
    shares: 98,
    tags: ['tech', 'unboxing', 'gadgets', 'smartphone'],
    isFollowing: false
  }
];

// Mock data for user profiles
export const mockUsers = [
  {
    id: '1',
    username: 'dance_star',
    displayName: 'Dance Star',
    bio: 'Professional dancer | Choreographer | Follow for daily dance videos',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    followers: 125000,
    following: 350,
    videos: mockVideos.filter(v => v.username === 'dance_star'),
    isVerified: true
  },
  {
    id: '2',
    username: 'travel_addict',
    displayName: 'Travel Addict',
    bio: 'Exploring the world one country at a time ✈️ | 25 countries and counting',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    followers: 85000,
    following: 420,
    videos: mockVideos.filter(v => v.username === 'travel_addict'),
    isVerified: false
  },
  {
    id: '3',
    username: 'food_lover',
    displayName: 'Food Lover',
    bio: 'Chef by profession, foodie by heart ❤️ | Sharing easy recipes',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    followers: 65000,
    following: 280,
    videos: mockVideos.filter(v => v.username === 'food_lover'),
    isVerified: false
  }
];

// Mock data for comments
export const mockComments = {
  '1': [
    {
      id: '1',
      username: 'user123',
      userImage: 'https://randomuser.me/api/portraits/women/23.jpg',
      text: 'Amazing dance moves! 🔥',
      likes: 42,
      timestamp: '2h ago',
      replies: [
        {
          id: '1-1',
          username: 'dance_star',
          userImage: 'https://randomuser.me/api/portraits/women/44.jpg',
          text: 'Thank you so much! 😊',
          likes: 12,
          timestamp: '1h ago'
        }
      ]
    },
    {
      id: '2',
      username: 'dance_fan',
      userImage: 'https://randomuser.me/api/portraits/men/55.jpg',
      text: 'Can you do a tutorial for this dance?',
      likes: 28,
      timestamp: '3h ago',
      replies: []
    }
  ],
  '2': [
    {
      id: '1',
      username: 'beach_lover',
      userImage: 'https://randomuser.me/api/portraits/women/67.jpg',
      text: 'Bali is on my bucket list! 😍',
      likes: 35,
      timestamp: '5h ago',
      replies: []
    }
  ]
};