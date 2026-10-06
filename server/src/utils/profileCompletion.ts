export interface ProfileCompletionResult {
  percentage: number;
  completed: number;
  total: number;
  missing: string[];
}

export function calculateProfileCompletion(member: any): ProfileCompletionResult {
  const criteria = [
    {
      key: 'fullName',
      label: 'Full Name',
      weight: 15,
      isComplete: !!(member.fullName && member.fullName.trim().length > 0),
    },
    {
      key: 'profilePhoto',
      label: 'Profile Photo',
      weight: 10,
      isComplete: !!(member.profilePhotoUrl && member.profilePhotoUrl.trim().length > 0),
    },
    {
      key: 'bio',
      label: 'Bio',
      weight: 10,
      isComplete: !!(member.bio && member.bio.trim().length > 0),
    },
    {
      key: 'department',
      label: 'Department',
      weight: 10,
      isComplete: !!(member.department && member.department.trim().length > 0),
    },
    {
      key: 'year',
      label: 'Year',
      weight: 10,
      isComplete: typeof member.year === 'number' && member.year >= 1 && member.year <= 5,
    },
    {
      key: 'skills',
      label: 'Skills',
      weight: 15,
      isComplete: Array.isArray(member.skills) && member.skills.length > 0,
    },
    {
      key: 'interests',
      label: 'Interests',
      weight: 10,
      isComplete:
        (Array.isArray(member.technicalInterests) && member.technicalInterests.length > 0) ||
        (Array.isArray(member.interests) && member.interests.length > 0),
    },
    {
      key: 'github',
      label: 'GitHub',
      weight: 5,
      isComplete: !!(member.githubUrl && member.githubUrl.trim().length > 0),
    },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      weight: 5,
      isComplete: !!(member.linkedinUrl && member.linkedinUrl.trim().length > 0),
    },
    {
      key: 'portfolio',
      label: 'Portfolio',
      weight: 5,
      isComplete: !!(member.portfolioUrl && member.portfolioUrl.trim().length > 0),
    },
    {
      key: 'phone',
      label: 'Phone',
      weight: 5,
      isComplete: !!(member.phone && member.phone.trim().length > 0),
    },
  ];

  let percentage = 0;
  let completed = 0;
  const missing: string[] = [];

  for (const item of criteria) {
    if (item.isComplete) {
      percentage += item.weight;
      completed++;
    } else {
      missing.push(item.key);
    }
  }

  // Normalize percentage to integer [0, 100]
  percentage = Math.min(100, Math.max(0, Math.round(percentage)));

  return {
    percentage,
    completed,
    total: criteria.length,
    missing,
  };
}
