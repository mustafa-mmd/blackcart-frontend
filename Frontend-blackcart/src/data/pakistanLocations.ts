export const pakistanLocations = {
  Punjab: [
    'Ahmadpur East', 'Ali Pur', 'Arifwala', 'Attock', 'Bahawalnagar',
    'Bahawalpur', 'Bhakkar', 'Bhalwal', 'Burewala', 'Chakwal', 'Chichawatni',
    'Chiniot', 'Chishtian', 'Daska', 'Dera Ghazi Khan', 'Dina', 'Dinga',
    'Dipalpur', 'Faisalabad', 'Fateh Jang', 'Gojra', 'Gujar Khan',
    'Gujranwala', 'Gujrat', 'Hafizabad', 'Hasilpur', 'Haveli Lakha', 'Jampur',
    'Jaranwala', 'Jatoi', 'Jauharabad', 'Jhang', 'Jhelum', 'Kabirwala',
    'Kamalia', 'Kamoke', 'Kasur', 'Khanewal', 'Khanpur', 'Khushab', 'Kot Addu',
    'Lahore', 'Lalamusa', 'Layyah', 'Liaquatpur', 'Lodhran', 'Mailsi',
    'Mandi Bahauddin', 'Mian Channu', 'Mianwali', 'Multan', 'Muridke', 'Murree',
    'Muzaffargarh', 'Nankana Sahib', 'Narowal', 'Okara', 'Pakpattan', 'Pasrur',
    'Pir Mahal', 'Rahim Yar Khan', 'Rajanpur', 'Rawalpindi', 'Sadiqabad',
    'Sahiwal', 'Sambrial', 'Samundri', 'Sargodha', 'Shahkot', 'Shakargarh',
    'Sheikhupura', 'Sialkot', 'Sohawa', 'Taxila', 'Toba Tek Singh', 'Vehari',
    'Wah Cantt', 'Wazirabad',
  ],
  Sindh: [
    'Badin', 'Dadu', 'Ghotki', 'Hyderabad', 'Jacobabad', 'Jamshoro', 'Karachi',
    'Khairpur', 'Larkana', 'Matiari', 'Mirpur Khas', 'Mithi',
    'Naushahro Feroze', 'Nawabshah', 'Shahdadkot', 'Shikarpur', 'Sukkur',
    'Tando Adam', 'Tando Allahyar', 'Tando Muhammad Khan', 'Thatta', 'Umerkot',
  ],
  'Khyber Pakhtunkhwa': [
    'Abbottabad', 'Bannu', 'Batkhela', 'Charsadda', 'Chitral',
    'Dera Ismail Khan', 'Hangu', 'Haripur', 'Kaghan', 'Kohat', 'Lakki Marwat',
    'Lower Dir', 'Malakand', 'Mansehra', 'Mardan', 'Mingora', 'Nowshera',
    'Peshawar', 'Shangla', 'Swabi', 'Swat', 'Tank', 'Timergara', 'Upper Dir',
  ],
  Balochistan: [
    'Awaran', 'Barkhan', 'Dera Allah Yar', 'Dera Murad Jamali', 'Gwadar', 'Hub',
    'Kalat', 'Khuzdar', 'Mastung', 'Nasirabad', 'Panjgur', 'Quetta', 'Sibi',
    'Turbat', 'Zhob', 'Ziarat',
  ],
  AJK: ['Bagh', 'Bhimber', 'Kotli', 'Mirpur', 'Muzaffarabad', 'Rawalakot'],
  'Gilgit-Baltistan': ['Gilgit', 'Hunza', 'Khaplu', 'Skardu'],
  'Islamabad Capital Territory': ['Islamabad'],
} as const

export type PakistanProvince = keyof typeof pakistanLocations

export const pakistanProvinces = Object.keys(pakistanLocations) as PakistanProvince[]
