import React, { useState, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, LabelList, ReferenceLine, Legend,
} from "recharts";
import { Activity, Users, AlertTriangle, ShieldCheck, TrendingDown, Wallet, Target, Scale } from "lucide-react";

/* ===== VERIFIED DATA (aggregates generated from the cleaned file, not hand-typed) ===== */
const D = {"meta": {"students": 100000, "dropouts": 32004, "overall": 0.32, "auc": 0.9037}, "segments": [{"dimension": "Family income", "value": "High", "students": 24978, "dropouts": 4993, "dropout_rate": 0.1999, "ci_low": 0.195, "ci_high": 0.2049, "lift_vs_overall": 0.6246}, {"dimension": "Family income", "value": "Low", "students": 34809, "dropouts": 14940, "dropout_rate": 0.4292, "ci_low": 0.424, "ci_high": 0.4344, "lift_vs_overall": 1.3411}, {"dimension": "Family income", "value": "Middle", "students": 40213, "dropouts": 12071, "dropout_rate": 0.3002, "ci_low": 0.2957, "ci_high": 0.3047, "lift_vs_overall": 0.9379}, {"dimension": "Tuition up to date", "value": "Not up to date", "students": 21514, "dropouts": 9514, "dropout_rate": 0.4422, "ci_low": 0.4356, "ci_high": 0.4489, "lift_vs_overall": 1.3818}, {"dimension": "Tuition up to date", "value": "Paid up", "students": 78486, "dropouts": 22490, "dropout_rate": 0.2865, "ci_low": 0.2834, "ci_high": 0.2897, "lift_vs_overall": 0.8954}, {"dimension": "Part-time job", "value": "No job", "students": 51808, "dropouts": 12809, "dropout_rate": 0.2472, "ci_low": 0.2435, "ci_high": 0.251, "lift_vs_overall": 0.7725}, {"dimension": "Part-time job", "value": "Has job", "students": 48192, "dropouts": 19195, "dropout_rate": 0.3983, "ci_low": 0.3939, "ci_high": 0.4027, "lift_vs_overall": 1.2445}, {"dimension": "Work hours / week", "value": "0 (no job)", "students": 51808, "dropouts": 12809, "dropout_rate": 0.2472, "ci_low": 0.2435, "ci_high": 0.251, "lift_vs_overall": 0.7725}, {"dimension": "Work hours / week", "value": "1-10", "students": 6750, "dropouts": 2142, "dropout_rate": 0.3173, "ci_low": 0.3063, "ci_high": 0.3285, "lift_vs_overall": 0.9915}, {"dimension": "Work hours / week", "value": "11-20", "students": 23923, "dropouts": 8994, "dropout_rate": 0.376, "ci_low": 0.3698, "ci_high": 0.3821, "lift_vs_overall": 1.1747}, {"dimension": "Work hours / week", "value": "21-30", "students": 15673, "dropouts": 7109, "dropout_rate": 0.4536, "ci_low": 0.4458, "ci_high": 0.4614, "lift_vs_overall": 1.4173}, {"dimension": "Work hours / week", "value": "31-40", "students": 1846, "dropouts": 950, "dropout_rate": 0.5146, "ci_low": 0.4918, "ci_high": 0.5374, "lift_vs_overall": 1.608}, {"dimension": "First generation", "value": "Not first-gen", "students": 57987, "dropouts": 16279, "dropout_rate": 0.2807, "ci_low": 0.2771, "ci_high": 0.2844, "lift_vs_overall": 0.8772}, {"dimension": "First generation", "value": "First-gen", "students": 42013, "dropouts": 15725, "dropout_rate": 0.3743, "ci_low": 0.3697, "ci_high": 0.3789, "lift_vs_overall": 1.1695}, {"dimension": "Disability", "value": "No disability", "students": 79123, "dropouts": 24376, "dropout_rate": 0.3081, "ci_low": 0.3049, "ci_high": 0.3113, "lift_vs_overall": 0.9626}, {"dimension": "Disability", "value": "Disability", "students": 20877, "dropouts": 7628, "dropout_rate": 0.3654, "ci_low": 0.3589, "ci_high": 0.3719, "lift_vs_overall": 1.1417}, {"dimension": "Scholarship", "value": "No scholarship", "students": 41030, "dropouts": 13642, "dropout_rate": 0.3325, "ci_low": 0.3279, "ci_high": 0.3371, "lift_vs_overall": 1.0389}, {"dimension": "Scholarship", "value": "Scholarship", "students": 58970, "dropouts": 18362, "dropout_rate": 0.3114, "ci_low": 0.3077, "ci_high": 0.3151, "lift_vs_overall": 0.9729}, {"dimension": "Study mode", "value": "Full-time", "students": 65096, "dropouts": 20830, "dropout_rate": 0.32, "ci_low": 0.3164, "ci_high": 0.3236, "lift_vs_overall": 0.9998}, {"dimension": "Study mode", "value": "Online", "students": 12929, "dropouts": 3776, "dropout_rate": 0.2921, "ci_low": 0.2843, "ci_high": 0.3, "lift_vs_overall": 0.9126}, {"dimension": "Study mode", "value": "Part-time", "students": 21975, "dropouts": 7398, "dropout_rate": 0.3367, "ci_low": 0.3304, "ci_high": 0.3429, "lift_vs_overall": 1.0519}, {"dimension": "Extracurricular", "value": "Does not", "students": 40521, "dropouts": 14701, "dropout_rate": 0.3628, "ci_low": 0.3581, "ci_high": 0.3675, "lift_vs_overall": 1.1336}, {"dimension": "Extracurricular", "value": "Participates", "students": 59479, "dropouts": 17303, "dropout_rate": 0.2909, "ci_low": 0.2873, "ci_high": 0.2946, "lift_vs_overall": 0.909}, {"dimension": "Mental health support", "value": "No support", "students": 68444, "dropouts": 21375, "dropout_rate": 0.3123, "ci_low": 0.3088, "ci_high": 0.3158, "lift_vs_overall": 0.9758}, {"dimension": "Mental health support", "value": "Uses support", "students": 31556, "dropouts": 10629, "dropout_rate": 0.3368, "ci_low": 0.3316, "ci_high": 0.3421, "lift_vs_overall": 1.0525}, {"dimension": "Gender", "value": "Female", "students": 50731, "dropouts": 16208, "dropout_rate": 0.3195, "ci_low": 0.3154, "ci_high": 0.3236, "lift_vs_overall": 0.9983}, {"dimension": "Gender", "value": "Male", "students": 47224, "dropouts": 15112, "dropout_rate": 0.32, "ci_low": 0.3158, "ci_high": 0.3242, "lift_vs_overall": 0.9999}, {"dimension": "Gender", "value": "Other", "students": 2045, "dropouts": 684, "dropout_rate": 0.3345, "ci_low": 0.3144, "ci_high": 0.3552, "lift_vs_overall": 1.0451}, {"dimension": "International student", "value": "Domestic", "students": 81906, "dropouts": 26196, "dropout_rate": 0.3198, "ci_low": 0.3166, "ci_high": 0.323, "lift_vs_overall": 0.9993}, {"dimension": "International student", "value": "International", "students": 18094, "dropouts": 5808, "dropout_rate": 0.321, "ci_low": 0.3142, "ci_high": 0.3278, "lift_vs_overall": 1.003}, {"dimension": "Course type", "value": "Arts & Humanities", "students": 18024, "dropouts": 5786, "dropout_rate": 0.321, "ci_low": 0.3142, "ci_high": 0.3279, "lift_vs_overall": 1.0031}, {"dimension": "Course type", "value": "Business", "students": 24986, "dropouts": 7957, "dropout_rate": 0.3185, "ci_low": 0.3127, "ci_high": 0.3243, "lift_vs_overall": 0.9951}, {"dimension": "Course type", "value": "Health Sciences", "students": 14941, "dropouts": 4798, "dropout_rate": 0.3211, "ci_low": 0.3137, "ci_high": 0.3287, "lift_vs_overall": 1.0034}, {"dimension": "Course type", "value": "Law & Social Sciences", "students": 11908, "dropouts": 3774, "dropout_rate": 0.3169, "ci_low": 0.3086, "ci_high": 0.3253, "lift_vs_overall": 0.9903}, {"dimension": "Course type", "value": "STEM", "students": 30141, "dropouts": 9689, "dropout_rate": 0.3215, "ci_low": 0.3162, "ci_high": 0.3268, "lift_vs_overall": 1.0044}, {"dimension": "Nationality", "value": "Australia", "students": 969, "dropouts": 312, "dropout_rate": 0.322, "ci_low": 0.2933, "ci_high": 0.3521, "lift_vs_overall": 1.0061}, {"dimension": "Nationality", "value": "Brazil", "students": 6873, "dropouts": 2183, "dropout_rate": 0.3176, "ci_low": 0.3067, "ci_high": 0.3287, "lift_vs_overall": 0.9924}, {"dimension": "Nationality", "value": "Canada", "students": 1967, "dropouts": 593, "dropout_rate": 0.3015, "ci_low": 0.2816, "ci_high": 0.3221, "lift_vs_overall": 0.942}, {"dimension": "Nationality", "value": "China", "students": 10013, "dropouts": 3253, "dropout_rate": 0.3249, "ci_low": 0.3158, "ci_high": 0.3341, "lift_vs_overall": 1.0151}, {"dimension": "Nationality", "value": "Egypt", "students": 1985, "dropouts": 622, "dropout_rate": 0.3134, "ci_low": 0.2933, "ci_high": 0.3341, "lift_vs_overall": 0.9791}, {"dimension": "Nationality", "value": "Germany", "students": 4072, "dropouts": 1326, "dropout_rate": 0.3256, "ci_low": 0.3114, "ci_high": 0.3402, "lift_vs_overall": 1.0175}, {"dimension": "Nationality", "value": "India", "students": 11994, "dropouts": 3863, "dropout_rate": 0.3221, "ci_low": 0.3138, "ci_high": 0.3305, "lift_vs_overall": 1.0064}, {"dimension": "Nationality", "value": "Indonesia", "students": 2982, "dropouts": 984, "dropout_rate": 0.33, "ci_low": 0.3133, "ci_high": 0.3471, "lift_vs_overall": 1.0311}, {"dimension": "Nationality", "value": "Mexico", "students": 6149, "dropouts": 1928, "dropout_rate": 0.3135, "ci_low": 0.3021, "ci_high": 0.3253, "lift_vs_overall": 0.9797}, {"dimension": "Nationality", "value": "Nigeria", "students": 5921, "dropouts": 1882, "dropout_rate": 0.3179, "ci_low": 0.3061, "ci_high": 0.3298, "lift_vs_overall": 0.9932}, {"dimension": "Nationality", "value": "Pakistan", "students": 3030, "dropouts": 983, "dropout_rate": 0.3244, "ci_low": 0.308, "ci_high": 0.3413, "lift_vs_overall": 1.0137}, {"dimension": "Nationality", "value": "Philippines", "students": 3956, "dropouts": 1259, "dropout_rate": 0.3183, "ci_low": 0.3039, "ci_high": 0.3329, "lift_vs_overall": 0.9944}, {"dimension": "Nationality", "value": "South Korea", "students": 4060, "dropouts": 1294, "dropout_rate": 0.3187, "ci_low": 0.3046, "ci_high": 0.3332, "lift_vs_overall": 0.9959}, {"dimension": "Nationality", "value": "UK", "students": 6050, "dropouts": 1941, "dropout_rate": 0.3208, "ci_low": 0.3092, "ci_high": 0.3327, "lift_vs_overall": 1.0025}, {"dimension": "Nationality", "value": "USA", "students": 29979, "dropouts": 9581, "dropout_rate": 0.3196, "ci_low": 0.3143, "ci_high": 0.3249, "lift_vs_overall": 0.9986}, {"dimension": "Semester", "value": "1", "students": 19995, "dropouts": 6740, "dropout_rate": 0.3371, "ci_low": 0.3306, "ci_high": 0.3437, "lift_vs_overall": 1.0533}, {"dimension": "Semester", "value": "2", "students": 17920, "dropouts": 6136, "dropout_rate": 0.3424, "ci_low": 0.3355, "ci_high": 0.3494, "lift_vs_overall": 1.0699}, {"dimension": "Semester", "value": "3", "students": 15170, "dropouts": 4754, "dropout_rate": 0.3134, "ci_low": 0.306, "ci_high": 0.3208, "lift_vs_overall": 0.9792}, {"dimension": "Semester", "value": "4", "students": 12967, "dropouts": 4053, "dropout_rate": 0.3126, "ci_low": 0.3046, "ci_high": 0.3206, "lift_vs_overall": 0.9766}, {"dimension": "Semester", "value": "5", "students": 11990, "dropouts": 3736, "dropout_rate": 0.3116, "ci_low": 0.3034, "ci_high": 0.3199, "lift_vs_overall": 0.9736}, {"dimension": "Semester", "value": "6", "students": 10027, "dropouts": 3009, "dropout_rate": 0.3001, "ci_low": 0.2912, "ci_high": 0.3091, "lift_vs_overall": 0.9377}, {"dimension": "Semester", "value": "7", "students": 6976, "dropouts": 2063, "dropout_rate": 0.2957, "ci_low": 0.2851, "ci_high": 0.3065, "lift_vs_overall": 0.924}, {"dimension": "Semester", "value": "8", "students": 4955, "dropouts": 1513, "dropout_rate": 0.3053, "ci_low": 0.2927, "ci_high": 0.3183, "lift_vs_overall": 0.9541}, {"dimension": "Age band", "value": "15-17", "students": 12758, "dropouts": 4012, "dropout_rate": 0.3145, "ci_low": 0.3065, "ci_high": 0.3226, "lift_vs_overall": 0.9826}, {"dimension": "Age band", "value": "18-20", "students": 26104, "dropouts": 8365, "dropout_rate": 0.3204, "ci_low": 0.3148, "ci_high": 0.3261, "lift_vs_overall": 1.0013}, {"dimension": "Age band", "value": "21-23", "students": 33023, "dropouts": 10695, "dropout_rate": 0.3239, "ci_low": 0.3188, "ci_high": 0.3289, "lift_vs_overall": 1.012}, {"dimension": "Age band", "value": "24-26", "students": 20405, "dropouts": 6427, "dropout_rate": 0.315, "ci_low": 0.3086, "ci_high": 0.3214, "lift_vs_overall": 0.9842}, {"dimension": "Age band", "value": "27-30", "students": 7710, "dropouts": 2505, "dropout_rate": 0.3249, "ci_low": 0.3145, "ci_high": 0.3354, "lift_vs_overall": 1.0152}, {"dimension": "Admission grade", "value": "0-80", "students": 3094, "dropouts": 1430, "dropout_rate": 0.4622, "ci_low": 0.4447, "ci_high": 0.4798, "lift_vs_overall": 1.4441}, {"dimension": "Admission grade", "value": "80-110", "students": 17651, "dropouts": 7004, "dropout_rate": 0.3968, "ci_low": 0.3896, "ci_high": 0.404, "lift_vs_overall": 1.2399}, {"dimension": "Admission grade", "value": "110-140", "students": 38730, "dropouts": 12848, "dropout_rate": 0.3317, "ci_low": 0.3271, "ci_high": 0.3364, "lift_vs_overall": 1.0365}, {"dimension": "Admission grade", "value": "140-170", "students": 30717, "dropouts": 8530, "dropout_rate": 0.2777, "ci_low": 0.2727, "ci_high": 0.2827, "lift_vs_overall": 0.8677}, {"dimension": "Admission grade", "value": "170-200", "students": 9808, "dropouts": 2192, "dropout_rate": 0.2235, "ci_low": 0.2154, "ci_high": 0.2318, "lift_vs_overall": 0.6983}, {"dimension": "GPA semester 1", "value": "0-1.5", "students": 9512, "dropouts": 8325, "dropout_rate": 0.8752, "ci_low": 0.8684, "ci_high": 0.8817, "lift_vs_overall": 2.7347}, {"dimension": "GPA semester 1", "value": "1.5-2.0", "students": 14621, "dropouts": 9425, "dropout_rate": 0.6446, "ci_low": 0.6368, "ci_high": 0.6523, "lift_vs_overall": 2.0142}, {"dimension": "GPA semester 1", "value": "2.0-2.5", "students": 22028, "dropouts": 8544, "dropout_rate": 0.3879, "ci_low": 0.3815, "ci_high": 0.3943, "lift_vs_overall": 1.2119}, {"dimension": "GPA semester 1", "value": "2.5-3.0", "students": 23498, "dropouts": 4271, "dropout_rate": 0.1818, "ci_low": 0.1769, "ci_high": 0.1867, "lift_vs_overall": 0.5679}, {"dimension": "GPA semester 1", "value": "3.0-3.5", "students": 17441, "dropouts": 1177, "dropout_rate": 0.0675, "ci_low": 0.0639, "ci_high": 0.0713, "lift_vs_overall": 0.2109}, {"dimension": "GPA semester 1", "value": "3.5-4.0", "students": 12900, "dropouts": 262, "dropout_rate": 0.0203, "ci_low": 0.018, "ci_high": 0.0229, "lift_vs_overall": 0.0635}, {"dimension": "GPA semester 2", "value": "0-1.0", "students": 9111, "dropouts": 7605, "dropout_rate": 0.8347, "ci_low": 0.8269, "ci_high": 0.8422, "lift_vs_overall": 2.6081}, {"dimension": "GPA semester 2", "value": "1.0-1.5", "students": 16582, "dropouts": 9863, "dropout_rate": 0.5948, "ci_low": 0.5873, "ci_high": 0.6023, "lift_vs_overall": 1.8585}, {"dimension": "GPA semester 2", "value": "1.5-2.0", "students": 25251, "dropouts": 9122, "dropout_rate": 0.3613, "ci_low": 0.3553, "ci_high": 0.3672, "lift_vs_overall": 1.1288}, {"dimension": "GPA semester 2", "value": "2.0-2.5", "students": 24823, "dropouts": 4187, "dropout_rate": 0.1687, "ci_low": 0.1641, "ci_high": 0.1734, "lift_vs_overall": 0.527}, {"dimension": "GPA semester 2", "value": "2.5-3.0", "students": 16522, "dropouts": 1041, "dropout_rate": 0.063, "ci_low": 0.0594, "ci_high": 0.0668, "lift_vs_overall": 0.1969}, {"dimension": "GPA semester 2", "value": "3.0-4.0", "students": 7711, "dropouts": 186, "dropout_rate": 0.0241, "ci_low": 0.0209, "ci_high": 0.0278, "lift_vs_overall": 0.0754}, {"dimension": "Units failed", "value": "0", "students": 17273, "dropouts": 768, "dropout_rate": 0.0445, "ci_low": 0.0415, "ci_high": 0.0476, "lift_vs_overall": 0.1389}, {"dimension": "Units failed", "value": "1", "students": 16601, "dropouts": 2278, "dropout_rate": 0.1372, "ci_low": 0.1321, "ci_high": 0.1425, "lift_vs_overall": 0.4288}, {"dimension": "Units failed", "value": "2", "students": 18429, "dropouts": 4592, "dropout_rate": 0.2492, "ci_low": 0.243, "ci_high": 0.2555, "lift_vs_overall": 0.7786}, {"dimension": "Units failed", "value": "3", "students": 16055, "dropouts": 5792, "dropout_rate": 0.3608, "ci_low": 0.3534, "ci_high": 0.3682, "lift_vs_overall": 1.1272}, {"dimension": "Units failed", "value": "4", "students": 12058, "dropouts": 5590, "dropout_rate": 0.4636, "ci_low": 0.4547, "ci_high": 0.4725, "lift_vs_overall": 1.4485}, {"dimension": "Units failed", "value": "5-6", "students": 13270, "dropouts": 7933, "dropout_rate": 0.5978, "ci_low": 0.5894, "ci_high": 0.6061, "lift_vs_overall": 1.8679}, {"dimension": "Units failed", "value": "7+", "students": 6314, "dropouts": 5051, "dropout_rate": 0.8, "ci_low": 0.7899, "ci_high": 0.8097, "lift_vs_overall": 2.4996}, {"dimension": "Attendance %", "value": "0-50", "students": 8716, "dropouts": 5157, "dropout_rate": 0.5917, "ci_low": 0.5813, "ci_high": 0.6019, "lift_vs_overall": 1.8487}, {"dimension": "Attendance %", "value": "50-60", "students": 11427, "dropouts": 5437, "dropout_rate": 0.4758, "ci_low": 0.4667, "ci_high": 0.485, "lift_vs_overall": 1.4867}, {"dimension": "Attendance %", "value": "60-70", "students": 17552, "dropouts": 6819, "dropout_rate": 0.3885, "ci_low": 0.3813, "ci_high": 0.3957, "lift_vs_overall": 1.2139}, {"dimension": "Attendance %", "value": "70-80", "students": 20588, "dropouts": 6341, "dropout_rate": 0.308, "ci_low": 0.3017, "ci_high": 0.3143, "lift_vs_overall": 0.9624}, {"dimension": "Attendance %", "value": "80-90", "students": 18379, "dropouts": 4487, "dropout_rate": 0.2441, "ci_low": 0.238, "ci_high": 0.2504, "lift_vs_overall": 0.7628}, {"dimension": "Attendance %", "value": "90-100", "students": 23338, "dropouts": 3763, "dropout_rate": 0.1612, "ci_low": 0.1566, "ci_high": 0.166, "lift_vs_overall": 0.5038}, {"dimension": "Assignments submitted %", "value": "0-40", "students": 6759, "dropouts": 4009, "dropout_rate": 0.5931, "ci_low": 0.5814, "ci_high": 0.6048, "lift_vs_overall": 1.8533}, {"dimension": "Assignments submitted %", "value": "40-55", "students": 14393, "dropouts": 6805, "dropout_rate": 0.4728, "ci_low": 0.4647, "ci_high": 0.481, "lift_vs_overall": 1.4773}, {"dimension": "Assignments submitted %", "value": "55-70", "students": 24252, "dropouts": 8920, "dropout_rate": 0.3678, "ci_low": 0.3618, "ci_high": 0.3739, "lift_vs_overall": 1.1492}, {"dimension": "Assignments submitted %", "value": "70-85", "students": 26357, "dropouts": 7356, "dropout_rate": 0.2791, "ci_low": 0.2737, "ci_high": 0.2845, "lift_vs_overall": 0.8721}, {"dimension": "Assignments submitted %", "value": "85-100", "students": 28239, "dropouts": 4914, "dropout_rate": 0.174, "ci_low": 0.1696, "ci_high": 0.1785, "lift_vs_overall": 0.5437}, {"dimension": "Missed deadlines", "value": "0", "students": 27231, "dropouts": 2642, "dropout_rate": 0.097, "ci_low": 0.0936, "ci_high": 0.1006, "lift_vs_overall": 0.3032}, {"dimension": "Missed deadlines", "value": "1", "students": 19268, "dropouts": 5368, "dropout_rate": 0.2786, "ci_low": 0.2723, "ci_high": 0.285, "lift_vs_overall": 0.8705}, {"dimension": "Missed deadlines", "value": "2", "students": 16692, "dropouts": 6447, "dropout_rate": 0.3862, "ci_low": 0.3789, "ci_high": 0.3936, "lift_vs_overall": 1.2068}, {"dimension": "Missed deadlines", "value": "3", "students": 12110, "dropouts": 5332, "dropout_rate": 0.4403, "ci_low": 0.4315, "ci_high": 0.4492, "lift_vs_overall": 1.3758}, {"dimension": "Missed deadlines", "value": "4-5", "students": 13792, "dropouts": 6472, "dropout_rate": 0.4693, "ci_low": 0.4609, "ci_high": 0.4776, "lift_vs_overall": 1.4662}, {"dimension": "Missed deadlines", "value": "6-7", "students": 6004, "dropouts": 2998, "dropout_rate": 0.4993, "ci_low": 0.4867, "ci_high": 0.512, "lift_vs_overall": 1.5602}, {"dimension": "Missed deadlines", "value": "8+", "students": 4903, "dropouts": 2745, "dropout_rate": 0.5599, "ci_low": 0.5459, "ci_high": 0.5737, "lift_vs_overall": 1.7493}, {"dimension": "LMS logins / week", "value": "0", "students": 3060, "dropouts": 1718, "dropout_rate": 0.5614, "ci_low": 0.5438, "ci_high": 0.5789, "lift_vs_overall": 1.7543}, {"dimension": "LMS logins / week", "value": "0-2", "students": 6202, "dropouts": 3013, "dropout_rate": 0.4858, "ci_low": 0.4734, "ci_high": 0.4983, "lift_vs_overall": 1.518}, {"dimension": "LMS logins / week", "value": "2-4", "students": 12164, "dropouts": 5167, "dropout_rate": 0.4248, "ci_low": 0.416, "ci_high": 0.4336, "lift_vs_overall": 1.3273}, {"dimension": "LMS logins / week", "value": "4-6", "students": 18147, "dropouts": 6651, "dropout_rate": 0.3665, "ci_low": 0.3595, "ci_high": 0.3735, "lift_vs_overall": 1.1452}, {"dimension": "LMS logins / week", "value": "6-8", "students": 20046, "dropouts": 6245, "dropout_rate": 0.3115, "ci_low": 0.3052, "ci_high": 0.318, "lift_vs_overall": 0.9734}, {"dimension": "LMS logins / week", "value": "8-10", "students": 17250, "dropouts": 4559, "dropout_rate": 0.2643, "ci_low": 0.2578, "ci_high": 0.2709, "lift_vs_overall": 0.8258}, {"dimension": "LMS logins / week", "value": "10+", "students": 23131, "dropouts": 4651, "dropout_rate": 0.2011, "ci_low": 0.196, "ci_high": 0.2063, "lift_vs_overall": 0.6283}, {"dimension": "Library visits / month", "value": "0", "students": 7815, "dropouts": 6048, "dropout_rate": 0.7739, "ci_low": 0.7645, "ci_high": 0.783, "lift_vs_overall": 2.4181}, {"dimension": "Library visits / month", "value": "1-2", "students": 27189, "dropouts": 11057, "dropout_rate": 0.4067, "ci_low": 0.4008, "ci_high": 0.4125, "lift_vs_overall": 1.2707}, {"dimension": "Library visits / month", "value": "3-5", "students": 36849, "dropouts": 9010, "dropout_rate": 0.2445, "ci_low": 0.2401, "ci_high": 0.2489, "lift_vs_overall": 0.764}, {"dimension": "Library visits / month", "value": "6-8", "students": 16268, "dropouts": 3561, "dropout_rate": 0.2189, "ci_low": 0.2126, "ci_high": 0.2253, "lift_vs_overall": 0.684}, {"dimension": "Library visits / month", "value": "9+", "students": 11879, "dropouts": 2328, "dropout_rate": 0.196, "ci_low": 0.1889, "ci_high": 0.2032, "lift_vs_overall": 0.6123}, {"dimension": "Stress level", "value": "1-2", "students": 3878, "dropouts": 770, "dropout_rate": 0.1986, "ci_low": 0.1863, "ci_high": 0.2114, "lift_vs_overall": 0.6204}, {"dimension": "Stress level", "value": "3-4", "students": 15109, "dropouts": 3620, "dropout_rate": 0.2396, "ci_low": 0.2329, "ci_high": 0.2465, "lift_vs_overall": 0.7486}, {"dimension": "Stress level", "value": "5-6", "students": 30942, "dropouts": 9119, "dropout_rate": 0.2947, "ci_low": 0.2897, "ci_high": 0.2998, "lift_vs_overall": 0.9209}, {"dimension": "Stress level", "value": "7-8", "students": 31107, "dropouts": 10663, "dropout_rate": 0.3428, "ci_low": 0.3375, "ci_high": 0.3481, "lift_vs_overall": 1.0711}, {"dimension": "Stress level", "value": "9-10", "students": 18964, "dropouts": 7832, "dropout_rate": 0.413, "ci_low": 0.406, "ci_high": 0.42, "lift_vs_overall": 1.2904}, {"dimension": "Satisfaction", "value": "1-2", "students": 3745, "dropouts": 1546, "dropout_rate": 0.4128, "ci_low": 0.3971, "ci_high": 0.4287, "lift_vs_overall": 1.2899}, {"dimension": "Satisfaction", "value": "3-4", "students": 15667, "dropouts": 5801, "dropout_rate": 0.3703, "ci_low": 0.3627, "ci_high": 0.3779, "lift_vs_overall": 1.1569}, {"dimension": "Satisfaction", "value": "5-6", "students": 33325, "dropouts": 11134, "dropout_rate": 0.3341, "ci_low": 0.3291, "ci_high": 0.3392, "lift_vs_overall": 1.0439}, {"dimension": "Satisfaction", "value": "7-8", "students": 31408, "dropouts": 9405, "dropout_rate": 0.2994, "ci_low": 0.2944, "ci_high": 0.3045, "lift_vs_overall": 0.9357}, {"dimension": "Satisfaction", "value": "9-10", "students": 15855, "dropouts": 4118, "dropout_rate": 0.2597, "ci_low": 0.253, "ci_high": 0.2666, "lift_vs_overall": 0.8116}, {"dimension": "Sleep hours", "value": "4-5", "students": 11056, "dropouts": 4075, "dropout_rate": 0.3686, "ci_low": 0.3596, "ci_high": 0.3776, "lift_vs_overall": 1.1517}, {"dimension": "Sleep hours", "value": "5-6", "students": 23201, "dropouts": 7905, "dropout_rate": 0.3407, "ci_low": 0.3346, "ci_high": 0.3468, "lift_vs_overall": 1.0646}, {"dimension": "Sleep hours", "value": "6-7", "students": 31616, "dropouts": 10021, "dropout_rate": 0.317, "ci_low": 0.3119, "ci_high": 0.3221, "lift_vs_overall": 0.9904}, {"dimension": "Sleep hours", "value": "7-8", "students": 23067, "dropouts": 6921, "dropout_rate": 0.3, "ci_low": 0.2942, "ci_high": 0.306, "lift_vs_overall": 0.9375}, {"dimension": "Sleep hours", "value": "8-10", "students": 11060, "dropouts": 3082, "dropout_rate": 0.2787, "ci_low": 0.2704, "ci_high": 0.2871, "lift_vs_overall": 0.8707}, {"dimension": "Commute (mins)", "value": "0-10", "students": 38273, "dropouts": 12084, "dropout_rate": 0.3157, "ci_low": 0.3111, "ci_high": 0.3204, "lift_vs_overall": 0.9865}, {"dimension": "Commute (mins)", "value": "10-20", "students": 20294, "dropouts": 6413, "dropout_rate": 0.316, "ci_low": 0.3096, "ci_high": 0.3224, "lift_vs_overall": 0.9874}, {"dimension": "Commute (mins)", "value": "20-40", "students": 22910, "dropouts": 7451, "dropout_rate": 0.3252, "ci_low": 0.3192, "ci_high": 0.3313, "lift_vs_overall": 1.0162}, {"dimension": "Commute (mins)", "value": "40-60", "students": 10336, "dropouts": 3383, "dropout_rate": 0.3273, "ci_low": 0.3183, "ci_high": 0.3364, "lift_vs_overall": 1.0227}, {"dimension": "Commute (mins)", "value": "60-120", "students": 8187, "dropouts": 2673, "dropout_rate": 0.3265, "ci_low": 0.3164, "ci_high": 0.3367, "lift_vs_overall": 1.0202}], "tiers": [{"risk_tier": "Low (<20%)", "students": 51404, "dropouts": 3133, "mean_predicted": 0.0606, "actual_rate": 0.0609, "share_of_students": 0.514, "share_of_all_dropouts": 0.0979}, {"risk_tier": "Moderate (20-50%)", "students": 20027, "dropouts": 6557, "mean_predicted": 0.3338, "actual_rate": 0.3274, "share_of_students": 0.2003, "share_of_all_dropouts": 0.2049}, {"risk_tier": "High (50-80%)", "students": 14712, "dropouts": 9628, "mean_predicted": 0.6498, "actual_rate": 0.6544, "share_of_students": 0.1471, "share_of_all_dropouts": 0.3008}, {"risk_tier": "Critical (80%+)", "students": 13857, "dropouts": 12686, "mean_predicted": 0.9126, "actual_rate": 0.9155, "share_of_students": 0.1386, "share_of_all_dropouts": 0.3964}], "deciles": [{"risk_decile": 1, "students": 10000, "dropouts": 107, "mean_predicted": 0.0049, "actual_rate": 0.0107, "cum_dropouts_captured": 1.0, "cum_students": 1.0}, {"risk_decile": 2, "students": 10000, "dropouts": 184, "mean_predicted": 0.0174, "actual_rate": 0.0184, "cum_dropouts_captured": 0.9967, "cum_students": 0.9}, {"risk_decile": 3, "students": 10000, "dropouts": 382, "mean_predicted": 0.0403, "actual_rate": 0.0382, "cum_dropouts_captured": 0.9909, "cum_students": 0.8}, {"risk_decile": 4, "students": 10000, "dropouts": 768, "mean_predicted": 0.0793, "actual_rate": 0.0768, "cum_dropouts_captured": 0.979, "cum_students": 0.7}, {"risk_decile": 5, "students": 10000, "dropouts": 1410, "mean_predicted": 0.1425, "actual_rate": 0.141, "cum_dropouts_captured": 0.955, "cum_students": 0.6}, {"risk_decile": 6, "students": 10000, "dropouts": 2396, "mean_predicted": 0.242, "actual_rate": 0.2396, "cum_dropouts_captured": 0.9109, "cum_students": 0.5}, {"risk_decile": 7, "students": 10000, "dropouts": 3741, "mean_predicted": 0.384, "actual_rate": 0.3741, "cum_dropouts_captured": 0.8361, "cum_students": 0.4}, {"risk_decile": 8, "students": 10000, "dropouts": 5765, "mean_predicted": 0.5717, "actual_rate": 0.5765, "cum_dropouts_captured": 0.7192, "cum_students": 0.3}, {"risk_decile": 9, "students": 10000, "dropouts": 7821, "mean_predicted": 0.7763, "actual_rate": 0.7821, "cum_dropouts_captured": 0.539, "cum_students": 0.2}, {"risk_decile": 10, "students": 10000, "dropouts": 9430, "mean_predicted": 0.942, "actual_rate": 0.943, "cum_dropouts_captured": 0.2947, "cum_students": 0.1}], "ladder": [{"risk_flag_count": 0, "students": 9825, "dropouts": 305, "dropout_rate": 0.031}, {"risk_flag_count": 1, "students": 19736, "dropouts": 1604, "dropout_rate": 0.0813}, {"risk_flag_count": 2, "students": 22294, "dropouts": 3906, "dropout_rate": 0.1752}, {"risk_flag_count": 3, "students": 18859, "dropouts": 6264, "dropout_rate": 0.3321}, {"risk_flag_count": 4, "students": 13511, "dropouts": 7293, "dropout_rate": 0.5398}, {"risk_flag_count": 5, "students": 8467, "dropouts": 6136, "dropout_rate": 0.7247}, {"risk_flag_count": 6, "students": 4473, "dropouts": 3807, "dropout_rate": 0.8511}, {"risk_flag_count": 7, "students": 2022, "dropouts": 1896, "dropout_rate": 0.9377}, {"risk_flag_count": 8, "students": 661, "dropouts": 642, "dropout_rate": 0.9713}, {"risk_flag_count": 9, "students": 135, "dropouts": 135, "dropout_rate": 1.0}, {"risk_flag_count": 10, "students": 17, "dropouts": 16, "dropout_rate": 0.9412}], "flagDefs": [{"flag": "flag_low_gpa", "students_flagged": 25241, "share_flagged": 0.2524, "dropout_rate_flagged": 0.6836, "dropout_rate_not_flagged": 0.1973, "gap_pp": 48.627}, {"flag": "flag_multi_fail", "students_flagged": 31642, "share_flagged": 0.3164, "dropout_rate_flagged": 0.587, "dropout_rate_not_flagged": 0.1965, "gap_pp": 39.0539}, {"flag": "flag_low_attendance", "students_flagged": 20011, "share_flagged": 0.2001, "dropout_rate_flagged": 0.5268, "dropout_rate_not_flagged": 0.2683, "gap_pp": 25.8436}, {"flag": "flag_missed_deadlines", "students_flagged": 36809, "share_flagged": 0.3681, "dropout_rate_flagged": 0.4767, "dropout_rate_not_flagged": 0.2288, "gap_pp": 24.7921}, {"flag": "flag_low_submission", "students_flagged": 21014, "share_flagged": 0.2101, "dropout_rate_flagged": 0.5117, "dropout_rate_not_flagged": 0.2691, "gap_pp": 24.2599}, {"flag": "flag_low_lms", "students_flagged": 20671, "share_flagged": 0.2067, "dropout_rate_flagged": 0.4644, "dropout_rate_not_flagged": 0.2824, "gap_pp": 18.1939}, {"flag": "flag_low_income", "students_flagged": 34809, "share_flagged": 0.3481, "dropout_rate_flagged": 0.4292, "dropout_rate_not_flagged": 0.2618, "gap_pp": 16.7445}, {"flag": "flag_heavy_work", "students_flagged": 20174, "share_flagged": 0.2017, "dropout_rate_flagged": 0.4532, "dropout_rate_not_flagged": 0.2864, "gap_pp": 16.6822}, {"flag": "flag_tuition_unpaid", "students_flagged": 21514, "share_flagged": 0.2151, "dropout_rate_flagged": 0.4422, "dropout_rate_not_flagged": 0.2865, "gap_pp": 15.5676}, {"flag": "flag_high_stress", "students_flagged": 33060, "share_flagged": 0.3306, "dropout_rate_flagged": 0.3878, "dropout_rate_not_flagged": 0.2866, "gap_pp": 10.124}], "matrix": [{"family_income_level": "High", "tuition_up_to_date": 0, "part_time_job": 0, "students": 2236, "dropouts": 542, "dropout_rate": 0.2424}, {"family_income_level": "High", "tuition_up_to_date": 0, "part_time_job": 1, "students": 1194, "dropouts": 442, "dropout_rate": 0.3702}, {"family_income_level": "High", "tuition_up_to_date": 1, "part_time_job": 0, "students": 13941, "dropouts": 2106, "dropout_rate": 0.1511}, {"family_income_level": "High", "tuition_up_to_date": 1, "part_time_job": 1, "students": 7607, "dropouts": 1903, "dropout_rate": 0.2502}, {"family_income_level": "Low", "tuition_up_to_date": 0, "part_time_job": 0, "students": 4169, "dropouts": 1895, "dropout_rate": 0.4545}, {"family_income_level": "Low", "tuition_up_to_date": 0, "part_time_job": 1, "students": 5941, "dropouts": 3468, "dropout_rate": 0.5837}, {"family_income_level": "Low", "tuition_up_to_date": 1, "part_time_job": 0, "students": 10104, "dropouts": 3066, "dropout_rate": 0.3034}, {"family_income_level": "Low", "tuition_up_to_date": 1, "part_time_job": 1, "students": 14595, "dropouts": 6511, "dropout_rate": 0.4461}, {"family_income_level": "Middle", "tuition_up_to_date": 0, "part_time_job": 0, "students": 4227, "dropouts": 1430, "dropout_rate": 0.3383}, {"family_income_level": "Middle", "tuition_up_to_date": 0, "part_time_job": 1, "students": 3747, "dropouts": 1737, "dropout_rate": 0.4636}, {"family_income_level": "Middle", "tuition_up_to_date": 1, "part_time_job": 0, "students": 17131, "dropouts": 3770, "dropout_rate": 0.2201}, {"family_income_level": "Middle", "tuition_up_to_date": 1, "part_time_job": 1, "students": 15108, "dropouts": 5134, "dropout_rate": 0.3398}], "fairness": [{"attribute": "Gender", "group": "Female", "students": 50731, "actual_dropout_rate": 0.3195, "mean_predicted_risk": 0.3192, "flagged_rate": 0.2851, "true_positive_rate": 0.6939, "false_positive_rate": 0.0932, "auc": 0.9038}, {"attribute": "Gender", "group": "Male", "students": 47224, "actual_dropout_rate": 0.32, "mean_predicted_risk": 0.321, "flagged_rate": 0.2867, "true_positive_rate": 0.7012, "false_positive_rate": 0.0916, "auc": 0.9038}, {"attribute": "Gender", "group": "Other", "students": 2045, "actual_dropout_rate": 0.3345, "mean_predicted_risk": 0.3192, "flagged_rate": 0.2812, "true_positive_rate": 0.6901, "false_positive_rate": 0.0757, "auc": 0.9017}, {"attribute": "Disability", "group": "0", "students": 79123, "actual_dropout_rate": 0.3081, "mean_predicted_risk": 0.3102, "flagged_rate": 0.2748, "true_positive_rate": 0.6915, "false_positive_rate": 0.0893, "auc": 0.9032}, {"attribute": "Disability", "group": "1", "students": 20877, "actual_dropout_rate": 0.3654, "mean_predicted_risk": 0.3573, "flagged_rate": 0.3272, "true_positive_rate": 0.7155, "false_positive_rate": 0.1036, "auc": 0.904}, {"attribute": "International", "group": "0", "students": 81906, "actual_dropout_rate": 0.3198, "mean_predicted_risk": 0.3205, "flagged_rate": 0.2864, "true_positive_rate": 0.6984, "false_positive_rate": 0.0926, "auc": 0.9042}, {"attribute": "International", "group": "1", "students": 18094, "actual_dropout_rate": 0.321, "mean_predicted_risk": 0.3181, "flagged_rate": 0.283, "true_positive_rate": 0.692, "false_positive_rate": 0.0896, "auc": 0.9014}, {"attribute": "Nationality", "group": "Australia", "students": 969, "actual_dropout_rate": 0.322, "mean_predicted_risk": 0.3216, "flagged_rate": 0.2951, "true_positive_rate": 0.6827, "false_positive_rate": 0.1111, "auc": 0.8876}, {"attribute": "Nationality", "group": "Brazil", "students": 6873, "actual_dropout_rate": 0.3176, "mean_predicted_risk": 0.3167, "flagged_rate": 0.2827, "true_positive_rate": 0.7087, "false_positive_rate": 0.0844, "auc": 0.9113}, {"attribute": "Nationality", "group": "Canada", "students": 1967, "actual_dropout_rate": 0.3015, "mean_predicted_risk": 0.3154, "flagged_rate": 0.2842, "true_positive_rate": 0.7218, "false_positive_rate": 0.0953, "auc": 0.9126}, {"attribute": "Nationality", "group": "China", "students": 10013, "actual_dropout_rate": 0.3249, "mean_predicted_risk": 0.3214, "flagged_rate": 0.2857, "true_positive_rate": 0.6935, "false_positive_rate": 0.0895, "auc": 0.9004}, {"attribute": "Nationality", "group": "Egypt", "students": 1985, "actual_dropout_rate": 0.3134, "mean_predicted_risk": 0.3148, "flagged_rate": 0.2725, "true_positive_rate": 0.6559, "false_positive_rate": 0.0976, "auc": 0.8931}, {"attribute": "Nationality", "group": "Germany", "students": 4072, "actual_dropout_rate": 0.3256, "mean_predicted_risk": 0.3201, "flagged_rate": 0.2809, "true_positive_rate": 0.675, "false_positive_rate": 0.0907, "auc": 0.8989}, {"attribute": "Nationality", "group": "India", "students": 11994, "actual_dropout_rate": 0.3221, "mean_predicted_risk": 0.322, "flagged_rate": 0.2889, "true_positive_rate": 0.7049, "false_positive_rate": 0.0913, "auc": 0.9062}, {"attribute": "Nationality", "group": "Indonesia", "students": 2982, "actual_dropout_rate": 0.33, "mean_predicted_risk": 0.3251, "flagged_rate": 0.2954, "true_positive_rate": 0.7063, "false_positive_rate": 0.0931, "auc": 0.9085}, {"attribute": "Nationality", "group": "Mexico", "students": 6149, "actual_dropout_rate": 0.3135, "mean_predicted_risk": 0.3199, "flagged_rate": 0.2851, "true_positive_rate": 0.7044, "false_positive_rate": 0.0936, "auc": 0.9094}, {"attribute": "Nationality", "group": "Nigeria", "students": 5921, "actual_dropout_rate": 0.3179, "mean_predicted_risk": 0.3193, "flagged_rate": 0.2864, "true_positive_rate": 0.6908, "false_positive_rate": 0.098, "auc": 0.8964}, {"attribute": "Nationality", "group": "Pakistan", "students": 3030, "actual_dropout_rate": 0.3244, "mean_predicted_risk": 0.3183, "flagged_rate": 0.2802, "true_positive_rate": 0.6938, "false_positive_rate": 0.0816, "auc": 0.9126}, {"attribute": "Nationality", "group": "Philippines", "students": 3956, "actual_dropout_rate": 0.3183, "mean_predicted_risk": 0.3209, "flagged_rate": 0.2844, "true_positive_rate": 0.6863, "false_positive_rate": 0.0968, "auc": 0.8962}, {"attribute": "Nationality", "group": "South Korea", "students": 4060, "actual_dropout_rate": 0.3187, "mean_predicted_risk": 0.3191, "flagged_rate": 0.2842, "true_positive_rate": 0.704, "false_positive_rate": 0.0879, "auc": 0.9091}, {"attribute": "Nationality", "group": "UK", "students": 6050, "actual_dropout_rate": 0.3208, "mean_predicted_risk": 0.3174, "flagged_rate": 0.2825, "true_positive_rate": 0.6899, "false_positive_rate": 0.09, "auc": 0.9058}, {"attribute": "Nationality", "group": "USA", "students": 29979, "actual_dropout_rate": 0.3196, "mean_predicted_risk": 0.3206, "flagged_rate": 0.2872, "true_positive_rate": 0.6989, "false_positive_rate": 0.0938, "auc": 0.9022}, {"attribute": "Family income", "group": "High", "students": 24978, "actual_dropout_rate": 0.1999, "mean_predicted_risk": 0.1999, "flagged_rate": 0.1493, "true_positive_rate": 0.5544, "false_positive_rate": 0.0481, "auc": 0.8991}, {"attribute": "Family income", "group": "Low", "students": 34809, "actual_dropout_rate": 0.4292, "mean_predicted_risk": 0.4292, "flagged_rate": 0.4112, "true_positive_rate": 0.7646, "false_positive_rate": 0.1454, "auc": 0.8944}, {"attribute": "Family income", "group": "Middle", "students": 40213, "actual_dropout_rate": 0.3002, "mean_predicted_risk": 0.3002, "flagged_rate": 0.262, "true_positive_rate": 0.673, "false_positive_rate": 0.0857, "auc": 0.9003}], "drivers": [{"dimension": "GPA semester 1", "min": 0.02, "max": 0.875, "spread_pp": 85.49}, {"dimension": "GPA semester 2", "min": 0.024, "max": 0.835, "spread_pp": 81.058}, {"dimension": "Units failed", "min": 0.044, "max": 0.8, "spread_pp": 75.551}, {"dimension": "Library visits / month", "min": 0.196, "max": 0.774, "spread_pp": 57.792}, {"dimension": "Missed deadlines", "min": 0.097, "max": 0.56, "spread_pp": 46.284}, {"dimension": "Attendance %", "min": 0.161, "max": 0.592, "spread_pp": 43.043}, {"dimension": "Assignments submitted %", "min": 0.174, "max": 0.593, "spread_pp": 41.912}, {"dimension": "LMS logins / week", "min": 0.201, "max": 0.561, "spread_pp": 36.037}, {"dimension": "Work hours / week", "min": 0.247, "max": 0.515, "spread_pp": 26.739}, {"dimension": "Admission grade", "min": 0.223, "max": 0.462, "spread_pp": 23.869}, {"dimension": "Family income", "min": 0.2, "max": 0.429, "spread_pp": 22.93}, {"dimension": "Stress level", "min": 0.199, "max": 0.413, "spread_pp": 21.444}, {"dimension": "Tuition up to date", "min": 0.287, "max": 0.442, "spread_pp": 15.568}, {"dimension": "Satisfaction", "min": 0.26, "max": 0.413, "spread_pp": 15.309}, {"dimension": "Part-time job", "min": 0.247, "max": 0.398, "spread_pp": 15.106}, {"dimension": "First generation", "min": 0.281, "max": 0.374, "spread_pp": 9.355}, {"dimension": "Sleep hours", "min": 0.279, "max": 0.369, "spread_pp": 8.992}, {"dimension": "Extracurricular", "min": 0.291, "max": 0.363, "spread_pp": 7.189}, {"dimension": "Disability", "min": 0.308, "max": 0.365, "spread_pp": 5.73}, {"dimension": "Semester", "min": 0.296, "max": 0.342, "spread_pp": 4.668}, {"dimension": "Study mode", "min": 0.292, "max": 0.337, "spread_pp": 4.46}, {"dimension": "Nationality", "min": 0.301, "max": 0.33, "spread_pp": 2.851}, {"dimension": "Mental health support", "min": 0.312, "max": 0.337, "spread_pp": 2.453}, {"dimension": "Scholarship", "min": 0.311, "max": 0.332, "spread_pp": 2.111}, {"dimension": "Gender", "min": 0.319, "max": 0.334, "spread_pp": 1.499}, {"dimension": "Commute (mins)", "min": 0.316, "max": 0.327, "spread_pp": 1.157}, {"dimension": "Age band", "min": 0.314, "max": 0.325, "spread_pp": 1.043}, {"dimension": "Course type", "min": 0.317, "max": 0.321, "spread_pp": 0.453}, {"dimension": "International student", "min": 0.32, "max": 0.321, "spread_pp": 0.116}], "adjOR": [{"term": "const", "OR": 1318.5874, "lo": 969.8846, "hi": 1792.6595, "p": 0.0}, {"term": "age", "OR": 0.9942, "lo": 0.9888, "hi": 0.9996, "p": 0.035}, {"term": "first_generation", "OR": 1.4057, "lo": 1.3541, "hi": 1.4592, "p": 0.0}, {"term": "scholarship_holder", "OR": 0.6381, "lo": 0.6135, "hi": 0.6636, "p": 0.0}, {"term": "tuition_up_to_date", "OR": 0.3925, "lo": 0.3754, "hi": 0.4103, "p": 0.0}, {"term": "part_time_job", "OR": 0.8935, "lo": 0.8264, "hi": 0.966, "p": 0.0047}, {"term": "weekly_work_hours", "OR": 1.0285, "lo": 1.0247, "hi": 1.0324, "p": 0.0}, {"term": "semester", "OR": 0.9544, "lo": 0.946, "hi": 0.9628, "p": 0.0}, {"term": "admission_grade", "OR": 0.997, "lo": 0.9964, "hi": 0.9977, "p": 0.0}, {"term": "previous_qualification_grade", "OR": 0.9993, "lo": 0.9986, "hi": 1.0001, "p": 0.0701}, {"term": "units_enrolled", "OR": 1.0528, "lo": null, "hi": null, "p": null}, {"term": "units_passed", "OR": 0.9538, "lo": null, "hi": null, "p": null}, {"term": "units_failed", "OR": 1.1038, "lo": null, "hi": null, "p": null}, {"term": "gpa_semester_1", "OR": 0.3092, "lo": 0.2922, "hi": 0.3272, "p": 0.0}, {"term": "gpa_semester_2", "OR": 0.4618, "lo": 0.4406, "hi": 0.484, "p": 0.0}, {"term": "attendance_rate", "OR": 0.9757, "lo": 0.9746, "hi": 0.9769, "p": 0.0}, {"term": "assignments_submitted_rate", "OR": 0.9862, "lo": 0.9852, "hi": 0.9871, "p": 0.0}, {"term": "library_visits_per_month", "OR": 0.941, "lo": 0.9358, "hi": 0.9462, "p": 0.0}, {"term": "lms_logins_per_week", "OR": 0.9219, "lo": 0.9169, "hi": 0.9269, "p": 0.0}, {"term": "extracurricular_activities", "OR": 0.7543, "lo": 0.7258, "hi": 0.7839, "p": 0.0}, {"term": "missed_deadlines", "OR": 1.1276, "lo": 1.1194, "hi": 1.1358, "p": 0.0}, {"term": "stress_level", "OR": 1.1273, "lo": 1.1164, "hi": 1.1383, "p": 0.0}, {"term": "mental_health_support", "OR": 1.0067, "lo": 0.9669, "hi": 1.0482, "p": 0.7454}, {"term": "satisfaction_score", "OR": 0.9344, "lo": 0.9256, "hi": 0.9433, "p": 0.0}, {"term": "commute_time_mins", "OR": 1.0012, "lo": 1.0004, "hi": 1.0019, "p": 0.0032}, {"term": "sleep_hours", "OR": 0.9554, "lo": 0.9406, "hi": 0.9705, "p": 0.0}, {"term": "family_income_level_Low", "OR": 2.1401, "lo": 2.0267, "hi": 2.2598, "p": 0.0}, {"term": "family_income_level_Middle", "OR": 1.4287, "lo": 1.3572, "hi": 1.5041, "p": 0.0}, {"term": "course_type_Business", "OR": 0.9808, "lo": 0.9267, "hi": 1.0381, "p": 0.5041}, {"term": "course_type_Health Sciences", "OR": 0.9879, "lo": 0.9263, "hi": 1.0537, "p": 0.7124}, {"term": "course_type_Law & Social Sciences", "OR": 0.9712, "lo": 0.9065, "hi": 1.0404, "p": 0.4052}, {"term": "course_type_STEM", "OR": 0.9925, "lo": 0.9397, "hi": 1.0482, "p": 0.7869}, {"term": "study_mode_Online", "OR": 1.2211, "lo": 1.137, "hi": 1.3114, "p": 0.0}, {"term": "study_mode_Part-time", "OR": 1.2353, "lo": 1.1621, "hi": 1.3132, "p": 0.0}], "lmsMode": [{"study_mode": "Full-time", "lms_band": "0-2", "students": 6779, "dropout_rate": 0.5073}, {"study_mode": "Full-time", "lms_band": "2-4", "students": 8901, "dropout_rate": 0.4179}, {"study_mode": "Full-time", "lms_band": "4-6", "students": 13140, "dropout_rate": 0.3583}, {"study_mode": "Full-time", "lms_band": "6-8", "students": 13897, "dropout_rate": 0.3027}, {"study_mode": "Full-time", "lms_band": "8-10", "students": 11264, "dropout_rate": 0.2451}, {"study_mode": "Full-time", "lms_band": "10+", "students": 11115, "dropout_rate": 0.1795}, {"study_mode": "Online", "lms_band": "0-2", "students": 95, "dropout_rate": 0.5158}, {"study_mode": "Online", "lms_band": "2-4", "students": 260, "dropout_rate": 0.5231}, {"study_mode": "Online", "lms_band": "4-6", "students": 700, "dropout_rate": 0.45}, {"study_mode": "Online", "lms_band": "6-8", "students": 1405, "dropout_rate": 0.39}, {"study_mode": "Online", "lms_band": "8-10", "students": 2149, "dropout_rate": 0.3532}, {"study_mode": "Online", "lms_band": "10+", "students": 8320, "dropout_rate": 0.2367}, {"study_mode": "Part-time", "lms_band": "0-2", "students": 2388, "dropout_rate": 0.5205}, {"study_mode": "Part-time", "lms_band": "2-4", "students": 3003, "dropout_rate": 0.4366}, {"study_mode": "Part-time", "lms_band": "4-6", "students": 4307, "dropout_rate": 0.378}, {"study_mode": "Part-time", "lms_band": "6-8", "students": 4744, "dropout_rate": 0.3141}, {"study_mode": "Part-time", "lms_band": "8-10", "students": 3837, "dropout_rate": 0.2708}, {"study_mode": "Part-time", "lms_band": "10+", "students": 3696, "dropout_rate": 0.1859}], "models": [{"model": "Full model (protected attributes excluded)", "auc_5fold": 0.9037, "description": "All academic, behavioural, financial, wellbeing features"}, {"model": "Full model minus family income", "auc_5fold": 0.9014, "description": "Income removed \u2014 almost no loss"}, {"model": "Leading indicators only", "auc_5fold": 0.8306, "description": "No GPA / units / grades \u2014 usable before results land"}, {"model": "Leading-only, no income / first-gen / scholarship", "auc_5fold": 0.8199, "description": "Behavioural + wellbeing + work only"}, {"model": "Engagement signals only", "auc_5fold": 0.8808, "description": "Attendance, submissions, deadlines, LMS, library"}], "scenarios": [{"retention_uplift_among_expected_dropouts": 0.05, "students_in_scope": 28569, "expected_dropouts_in_scope": 22314, "students_retained": 1116}, {"retention_uplift_among_expected_dropouts": 0.1, "students_in_scope": 28569, "expected_dropouts_in_scope": 22314, "students_retained": 2231}, {"retention_uplift_among_expected_dropouts": 0.15, "students_in_scope": 28569, "expected_dropouts_in_scope": 22314, "students_retained": 3347}], "kpi": {"students": 100000.0, "dropouts": 32004.0, "dropout_rate": 0.32004, "retained": 67996.0, "model_auc_5fold": 0.9037288426040104, "high_critical_students": 28569.0, "high_critical_share_of_students": 0.28569, "high_critical_dropouts": 22314.0, "high_critical_share_of_dropouts": 0.697225346831646, "low_income_tuition_unpaid_students": 10110.0, "low_income_tuition_unpaid_dropout_rate": 0.5304648862512364, "work_20plus_hours_students": 20174.0, "work_20plus_hours_dropout_rate": 0.45320709824526617, "zero_failed_units_dropout_rate": 0.04446245585596017, "one_failed_unit_students": 16601.0, "one_failed_unit_dropout_rate": 0.1372206493584724}};

/* ===== TOKENS: triage palette ===== */
const T = {
  bg: "#EEF3F2", card: "#FFFFFF", line: "#D9E3E1", ink: "#0E1F20", muted: "#5A6B6C",
  deep: "#0F3D3E", deep2: "#175457",
  low: "#2E9B6F", mod: "#E8A33D", high: "#E06C3C", crit: "#C23B4E",
  lowSoft: "#E3F3EC", modSoft: "#FBF0DC", highSoft: "#FBE8DF", critSoft: "#F7E1E4",
};
const TIER = [
  { key: "Low", color: T.low, soft: T.lowSoft },
  { key: "Moderate", color: T.mod, soft: T.modSoft },
  { key: "High", color: T.high, soft: T.highSoft },
  { key: "Critical", color: T.crit, soft: T.critSoft },
];
const F_DISPLAY = "'Space Grotesk', 'Inter', sans-serif";
const F_BODY = "'Inter', system-ui, sans-serif";
const F_MONO = "'IBM Plex Mono', monospace";
const pct = (x, d = 1) => `${(x * 100).toFixed(d)}%`;
const num = (x) => Number(x).toLocaleString("en-US");
const OVERALL = D.meta.overall;

const Fonts = () => (
  <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap'); *{box-sizing:border-box}`}</style>
);

function Card({ eyebrow, title, children, style }) {
  return (
    <div className="rounded-xl p-5" style={{ background: T.card, border: `1px solid ${T.line}`, ...style }}>
      {eyebrow && <div className="text-xs uppercase tracking-wider mb-1" style={{ color: T.deep2, fontFamily: F_BODY, fontWeight: 600 }}>{eyebrow}</div>}
      {title && <div className="text-lg mb-3" style={{ color: T.ink, fontFamily: F_DISPLAY, fontWeight: 600 }}>{title}</div>}
      {children}
    </div>
  );
}
function Kpi({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="rounded-xl p-4 flex-1" style={{ background: T.deep, minWidth: 150, borderTop: `3px solid ${accent || T.mod}` }}>
      <div className="flex items-center gap-2 mb-2"><Icon size={14} color={accent || T.mod} />
        <span className="text-xs uppercase tracking-wider" style={{ color: "#9CC0BE", fontFamily: F_BODY }}>{label}</span></div>
      <div className="text-3xl" style={{ color: "#fff", fontFamily: F_MONO, fontWeight: 600 }}>{value}</div>
      {sub && <div className="text-xs mt-1" style={{ color: "#7FA6A4", fontFamily: F_BODY }}>{sub}</div>}
    </div>
  );
}
const tip = { contentStyle: { fontFamily: F_BODY, borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 12 } };
const ax = { tick: { fontFamily: F_BODY, fontSize: 11, fill: T.muted }, axisLine: { stroke: T.line }, tickLine: false };
const axm = { tick: { fontFamily: F_MONO, fontSize: 11, fill: T.muted }, axisLine: false, tickLine: false };

const CAT = {
  Academic: ["GPA semester 1", "GPA semester 2", "Units failed", "Admission grade"],
  Engagement: ["Library visits / month", "Missed deadlines", "Attendance %", "Assignments submitted %", "LMS logins / week"],
  Financial: ["Work hours / week", "Family income", "Tuition up to date", "Part-time job"],
  Wellbeing: ["Stress level", "Satisfaction", "Sleep hours"],
};
const catOf = (dim) => Object.keys(CAT).find((k) => CAT[k].includes(dim)) || "Background";
const CATCOL = { Academic: T.crit, Engagement: T.high, Financial: T.mod, Wellbeing: T.deep2, Background: "#9AA9A8" };

/* ===== TABS ===== */
function Overview() {
  const top = D.drivers.slice(0, 14).map((d) => ({ dim: d.dimension, gap: d.spread_pp, cat: catOf(d.dimension) }));
  const flat = ["Gender", "Nationality", "Course type", "International student", "Age band", "Commute (mins)"].map((dim) => {
    const g = D.segments.filter((s) => s.dimension === dim && s.students >= 500);
    const mx = Math.max(...g.map((s) => s.dropout_rate)), mn = Math.min(...g.map((s) => s.dropout_rate));
    return { dim, gap: (mx - mn) * 100 };
  });
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3">
        <Kpi icon={Users} label="Students" value={num(D.meta.students)} sub="records analysed" accent={T.low} />
        <Kpi icon={TrendingDown} label="Dropout rate" value={pct(OVERALL)} sub={`${num(D.meta.dropouts)} students left`} accent={T.crit} />
        <Kpi icon={Target} label="Model AUC" value={D.meta.auc.toFixed(2)} sub="5-fold, out-of-sample" accent={T.mod} />
        <Kpi icon={AlertTriangle} label="High + Critical" value={pct(D.kpi.high_critical_share_of_students, 0)} sub={`holds ${pct(D.kpi.high_critical_share_of_dropouts, 0)} of all dropouts`} accent={T.high} />
      </div>
      <Card eyebrow="What drives dropout" title="Gap in dropout rate, best vs worst group (percentage points)">
        <div className="flex flex-wrap gap-3 mb-2 text-xs" style={{ fontFamily: F_BODY, color: T.muted }}>
          {Object.keys(CATCOL).map((k) => (<span key={k} className="flex items-center gap-1"><span style={{ width: 10, height: 10, background: CATCOL[k], display: "inline-block", borderRadius: 2 }} />{k}</span>))}
        </div>
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={top} layout="vertical" margin={{ left: 20, right: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.line} horizontal={false} />
            <XAxis type="number" {...axm} />
            <YAxis type="category" dataKey="dim" width={150} {...ax} />
            <Tooltip {...tip} formatter={(v) => `${v.toFixed(1)} pp`} />
            <Bar dataKey="gap" radius={[0, 5, 5, 0]}>
              {top.map((d, i) => <Cell key={i} fill={CATCOL[d.cat]} />)}
              <LabelList dataKey="gap" position="right" formatter={(v) => v.toFixed(0)} style={{ fontFamily: F_MONO, fontSize: 11, fill: T.ink }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card eyebrow="What does not" title="Identity and background gaps are small">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {flat.map((f) => (
            <div key={f.dim} className="rounded-lg p-3" style={{ background: T.lowSoft }}>
              <div className="text-xs" style={{ color: T.muted, fontFamily: F_BODY }}>{f.dim}</div>
              <div className="text-xl" style={{ fontFamily: F_MONO, color: T.deep, fontWeight: 600 }}>{f.gap.toFixed(1)} pp</div>
            </div>
          ))}
        </div>
        <p className="text-sm mt-3" style={{ color: T.ink, fontFamily: F_BODY }}>
          Target by need and behaviour, not by demographic group.
        </p>
      </Card>
    </div>
  );
}

function Drivers() {
  const dims = useMemo(() => D.drivers.map((d) => d.dimension).concat(["Gender", "Nationality", "Course type"].filter((x) => !D.drivers.find((d) => d.dimension === x))), []);
  const [dim, setDim] = useState(dims[0]);
  const ORD = { "Family income": ["Low", "Middle", "High"] };
  const rows = D.segments.filter((s) => s.dimension === dim).sort((a, b) => ORD[dim] ? ORD[dim].indexOf(a.value) - ORD[dim].indexOf(b.value) : 0);
  const data = rows.map((r) => ({ ...r, rate: r.dropout_rate * 100, label: r.value }));
  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm" style={{ fontFamily: F_BODY, color: T.muted }}>Driver:</span>
          <select value={dim} onChange={(e) => setDim(e.target.value)} className="px-3 py-2 rounded-lg text-sm"
            style={{ fontFamily: F_BODY, border: `1px solid ${T.line}`, color: T.ink, background: "#fff" }}>
            {dims.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <span className="text-xs px-3 py-1 rounded-full" style={{ background: T.modSoft, color: "#8A5B0B", fontFamily: F_BODY, fontWeight: 600 }}>
            dashed line = overall {pct(OVERALL)}
          </span>
        </div>
      </Card>
      <Card eyebrow="Dropout rate" title={dim}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.line} vertical={false} />
            <XAxis dataKey="label" {...ax} interval={0} angle={data.length > 7 ? -30 : 0} textAnchor={data.length > 7 ? "end" : "middle"} height={data.length > 7 ? 70 : 30} />
            <YAxis {...axm} unit="%" domain={[0, "auto"]} />
            <Tooltip {...tip} formatter={(v, n, p) => [`${v.toFixed(1)}%  (n=${num(p.payload.students)}, 95% CI ${pct(p.payload.ci_low)}-${pct(p.payload.ci_high)})`, "Dropout"]} />
            <ReferenceLine y={OVERALL * 100} stroke={T.deep} strokeDasharray="5 4" />
            <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
              {data.map((d, i) => <Cell key={i} fill={d.dropout_rate > OVERALL * 1.25 ? T.crit : d.dropout_rate > OVERALL * 1.05 ? T.high : d.dropout_rate < OVERALL * 0.75 ? T.low : T.deep2} />)}
              <LabelList dataKey="rate" position="top" formatter={(v) => `${v.toFixed(0)}%`} style={{ fontFamily: F_MONO, fontSize: 11, fill: T.ink }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card eyebrow="Detail" title="Counts, rate and lift">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ fontFamily: F_BODY, borderCollapse: "collapse" }}>
            <thead><tr style={{ color: T.muted, textAlign: "left" }}>
              {["Group", "Students", "Dropouts", "Rate", "95% CI", "Lift"].map((h) => <th key={h} className="pb-2 pr-3">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.value} style={{ borderTop: `1px solid ${T.line}` }}>
                  <td className="py-2 pr-3 font-semibold" style={{ color: T.ink }}>{r.value}</td>
                  <td className="py-2 pr-3" style={{ fontFamily: F_MONO }}>{num(r.students)}</td>
                  <td className="py-2 pr-3" style={{ fontFamily: F_MONO }}>{num(r.dropouts)}</td>
                  <td className="py-2 pr-3 font-bold" style={{ fontFamily: F_MONO }}>{pct(r.dropout_rate)}</td>
                  <td className="py-2 pr-3" style={{ fontFamily: F_MONO, color: T.muted }}>{pct(r.ci_low)}-{pct(r.ci_high)}</td>
                  <td className="py-2 pr-3" style={{ fontFamily: F_MONO }}>{r.lift_vs_overall.toFixed(2)}x</td>
                </tr>))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

const FLAG_LABEL = {
  flag_low_gpa: "GPA (sem 2) below 1.5", flag_multi_fail: "4+ failed units", flag_low_attendance: "Attendance below 60%",
  flag_missed_deadlines: "3+ missed deadlines", flag_low_submission: "Assignments below 55%", flag_low_lms: "Under 4 LMS logins / wk",
  flag_low_income: "Low family income", flag_heavy_work: "Works 20+ hrs / wk", flag_tuition_unpaid: "Tuition not up to date", flag_high_stress: "Stress 8+",
};
const LEADING = new Set(["flag_low_attendance", "flag_missed_deadlines", "flag_low_submission", "flag_low_lms", "flag_tuition_unpaid", "flag_heavy_work", "flag_high_stress"]);

function Triage() {
  const tiers = D.tiers.map((t, i) => ({ ...t, ...TIER[i], name: t.risk_tier.split(" ")[0] }));
  const cap = [{ x: 0, y: 0, base: 0 }].concat([...D.deciles].sort((a, b) => b.risk_decile - a.risk_decile).map((d) => ({ x: Math.round(d.cum_students * 100), y: +(d.cum_dropouts_captured * 100).toFixed(1), base: Math.round(d.cum_students * 100) })));
  const ladder = D.ladder.filter((l) => l.risk_flag_count <= 9).map((l) => ({ flags: String(l.risk_flag_count), rate: +(l.dropout_rate * 100).toFixed(1), n: l.students }));
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tiers.map((t) => (
          <div key={t.name} className="rounded-xl p-4" style={{ background: t.soft, borderLeft: `5px solid ${t.color}` }}>
            <div className="text-xs uppercase tracking-wider" style={{ color: t.color, fontFamily: F_BODY, fontWeight: 700 }}>{t.name}</div>
            <div className="text-2xl" style={{ fontFamily: F_MONO, color: T.ink, fontWeight: 600 }}>{pct(t.actual_rate, 0)}</div>
            <div className="text-xs" style={{ color: T.muted, fontFamily: F_BODY }}>{num(t.students)} students</div>
            <div className="text-xs" style={{ color: T.muted, fontFamily: F_BODY }}>{pct(t.share_of_all_dropouts, 0)} of all dropouts</div>
          </div>))}
      </div>
      <Card eyebrow="Calibration" title="Predicted risk matches observed dropout in every tier">
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={tiers.map((t) => ({ name: t.name, Predicted: +(t.mean_predicted * 100).toFixed(1), Actual: +(t.actual_rate * 100).toFixed(1) }))} margin={{ left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.line} vertical={false} />
            <XAxis dataKey="name" {...ax} /><YAxis {...axm} unit="%" /><Tooltip {...tip} formatter={(v) => `${v}%`} /><Legend wrapperStyle={{ fontFamily: F_BODY, fontSize: 12 }} />
            <Bar dataKey="Predicted" fill="#9AA9A8" radius={[4, 4, 0, 0]} /><Bar dataKey="Actual" fill={T.deep} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card eyebrow="Targeting efficiency" title="Share of dropouts reached vs share of students contacted">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={cap} margin={{ left: -10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.line} />
              <XAxis dataKey="x" type="number" domain={[0, 100]} unit="%" {...axm} /><YAxis {...axm} unit="%" domain={[0, 100]} />
              <Tooltip {...tip} formatter={(v) => `${v}%`} labelFormatter={(l) => `Top ${l}% by risk`} />
              <Line dataKey="base" stroke="#B7C4C3" strokeDasharray="4 4" dot={false} name="Random outreach" />
              <Line dataKey="y" stroke={T.crit} strokeWidth={3} dot={{ r: 3 }} name="Risk-ranked outreach" />
              <Legend wrapperStyle={{ fontFamily: F_BODY, fontSize: 12 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card eyebrow="Risk compounds" title="Dropout rate by number of risk flags">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={ladder} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.line} vertical={false} />
              <XAxis dataKey="flags" {...ax} /><YAxis {...axm} unit="%" domain={[0, 100]} />
              <Tooltip {...tip} formatter={(v, n, p) => [`${v}%  (n=${num(p.payload.n)})`, "Dropout"]} labelFormatter={(l) => `${l} flags`} />
              <ReferenceLine y={OVERALL * 100} stroke={T.deep} strokeDasharray="5 4" />
              <Bar dataKey="rate" radius={[5, 5, 0, 0]}>{ladder.map((l, i) => <Cell key={i} fill={l.rate >= 80 ? T.crit : l.rate >= 50 ? T.high : l.rate >= 20 ? T.mod : T.low} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <Card eyebrow="The ten flags" title="Leading flags act now; lagging flags confirm trouble">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ fontFamily: F_BODY, borderCollapse: "collapse" }}>
            <thead><tr style={{ color: T.muted, textAlign: "left" }}>{["Flag", "Type", "Flagged", "Dropout if flagged", "If not"].map((h) => <th key={h} className="pb-2 pr-3">{h}</th>)}</tr></thead>
            <tbody>{D.flagDefs.map((f) => (
              <tr key={f.flag} style={{ borderTop: `1px solid ${T.line}` }}>
                <td className="py-2 pr-3 font-semibold" style={{ color: T.ink }}>{FLAG_LABEL[f.flag]}</td>
                <td className="py-2 pr-3"><span className="text-xs px-2 py-0.5 rounded-full" style={{ background: LEADING.has(f.flag) ? T.lowSoft : T.modSoft, color: LEADING.has(f.flag) ? T.low : "#8A5B0B", fontWeight: 600 }}>{LEADING.has(f.flag) ? "Leading" : "Lagging"}</span></td>
                <td className="py-2 pr-3" style={{ fontFamily: F_MONO }}>{num(f.students_flagged)}</td>
                <td className="py-2 pr-3 font-bold" style={{ fontFamily: F_MONO }}>{pct(f.dropout_rate_flagged)}</td>
                <td className="py-2 pr-3" style={{ fontFamily: F_MONO, color: T.muted }}>{pct(f.dropout_rate_not_flagged)}</td>
              </tr>))}</tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Equity() {
  const attrs = [...new Set(D.fairness.map((f) => f.attribute))];
  const [attr, setAttr] = useState(attrs[0]);
  const rows = D.fairness.filter((f) => f.attribute === attr).map((f) => ({ ...f, name: f.group === "0" ? "No" : f.group === "1" ? "Yes" : f.group }));
  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-wrap gap-2 items-center">
          {attrs.map((a) => (
            <button key={a} onClick={() => setAttr(a)} className="px-3 py-2 rounded-lg text-sm" style={{ fontFamily: F_BODY, fontWeight: 600, background: attr === a ? T.deep : "#fff", color: attr === a ? "#fff" : T.muted, border: `1px solid ${attr === a ? T.deep : T.line}` }}>{a}</button>))}
        </div>
        <p className="text-xs mt-3" style={{ color: T.muted, fontFamily: F_BODY }}>The model never sees gender, nationality, disability or international status. Outcomes are audited at a 50% decision threshold.</p>
      </Card>
      <Card eyebrow="Audit" title={`${attr}: actual dropout vs share flagged`}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={rows.map((r) => ({ name: r.name, Actual: +(r.actual_dropout_rate * 100).toFixed(1), Flagged: +(r.flagged_rate * 100).toFixed(1) }))} margin={{ left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.line} vertical={false} />
            <XAxis dataKey="name" {...ax} interval={0} angle={rows.length > 6 ? -35 : 0} textAnchor={rows.length > 6 ? "end" : "middle"} height={rows.length > 6 ? 70 : 30} />
            <YAxis {...axm} unit="%" /><Tooltip {...tip} formatter={(v) => `${v}%`} /><Legend wrapperStyle={{ fontFamily: F_BODY, fontSize: 12 }} />
            <Bar dataKey="Actual" fill={T.deep} radius={[4, 4, 0, 0]} /><Bar dataKey="Flagged" fill={T.high} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card eyebrow="Error rates" title="Catches true dropouts (TPR) and false alarms (FPR)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ fontFamily: F_BODY, borderCollapse: "collapse" }}>
            <thead><tr style={{ color: T.muted, textAlign: "left" }}>{["Group", "Students", "TPR", "FPR", "AUC"].map((h) => <th key={h} className="pb-2 pr-3">{h}</th>)}</tr></thead>
            <tbody>{rows.map((r) => (
              <tr key={r.group} style={{ borderTop: `1px solid ${T.line}` }}>
                <td className="py-2 pr-3 font-semibold" style={{ color: T.ink }}>{r.name}</td>
                <td className="py-2 pr-3" style={{ fontFamily: F_MONO }}>{num(r.students)}</td>
                <td className="py-2 pr-3" style={{ fontFamily: F_MONO }}>{pct(r.true_positive_rate)}</td>
                <td className="py-2 pr-3" style={{ fontFamily: F_MONO }}>{pct(r.false_positive_rate)}</td>
                <td className="py-2 pr-3" style={{ fontFamily: F_MONO }}>{r.auc.toFixed(3)}</td>
              </tr>))}</tbody>
          </table>
        </div>
        {attr === "Family income" && <p className="text-sm mt-3" style={{ color: T.ink, fontFamily: F_BODY }}>Low-income students get more false alarms because their base rate is higher. A flag should open a supportive conversation, never a penalty.</p>}
      </Card>
    </div>
  );
}

function Actions() {
  const scopes = {
    "Critical only": ["Critical"], "High + Critical": ["High", "Critical"], "Moderate and above": ["Moderate", "High", "Critical"],
  };
  const [scope, setScope] = useState("High + Critical");
  const [uplift, setUplift] = useState(10);
  const sel = D.tiers.filter((t) => scopes[scope].includes(t.risk_tier.split(" ")[0]));
  const students = sel.reduce((a, t) => a + t.students, 0), drops = sel.reduce((a, t) => a + t.dropouts, 0);
  const retained = Math.round(drops * uplift / 100);
  const seg = (dim, val) => D.segments.find((s) => s.dimension === dim && s.value === val);
  const aor = (t) => D.adjOR.find((r) => r.term === t);
  const recs = [
    { icon: Activity, t: "Weekly early-warning list", d: `Refer students with 3+ flags. Leading-indicator model AUC ${D.models.find((m) => m.model.startsWith("Leading indicators")).auc_5fold.toFixed(2)}.` },
    { icon: AlertTriangle, t: "Tiered response", d: `Critical ${pct(D.tiers[3].actual_rate, 0)} dropout: case management. High ${pct(D.tiers[2].actual_rate, 0)}: advisor outreach. Moderate: automated nudges.` },
    { icon: Wallet, t: "Tuition arrears first", d: `Not up to date ${pct(seg("Tuition up to date", "Not up to date").dropout_rate)} vs ${pct(seg("Tuition up to date", "Paid up").dropout_rate)}. Low income + unpaid: ${pct(D.kpi.low_income_tuition_unpaid_dropout_rate)} (${num(D.kpi.low_income_tuition_unpaid_students)} students).` },
    { icon: ShieldCheck, t: "Scholarships and work limits", d: `Scholarship adjusted OR ${aor("scholarship_holder").OR.toFixed(2)}. 20+ work hours: ${pct(D.kpi.work_20plus_hours_dropout_rate)} dropout (${num(D.kpi.work_20plus_hours_students)} students).` },
    { icon: TrendingDown, t: "Act at the first failed unit", d: `1 failed unit ${pct(D.kpi.one_failed_unit_dropout_rate)} vs 0 units ${pct(D.kpi.zero_failed_units_dropout_rate)}. ${num(D.kpi.one_failed_unit_students)} students sit at exactly one.` },
    { icon: Scale, t: "Pilot, then scale, mental health support", d: `No dropout difference at equal stress (adjusted OR ${aor("mental_health_support").OR.toFixed(2)}). Evaluate before expanding.` },
  ];
  return (
    <div className="space-y-5">
      <Card eyebrow="Scenario (assumption-driven)" title="What could outreach retain?">
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.keys(scopes).map((s) => (
            <button key={s} onClick={() => setScope(s)} className="px-3 py-2 rounded-lg text-sm" style={{ fontFamily: F_BODY, fontWeight: 600, background: scope === s ? T.deep : "#fff", color: scope === s ? "#fff" : T.muted, border: `1px solid ${scope === s ? T.deep : T.line}` }}>{s}</button>))}
        </div>
        <div className="flex items-center gap-3 mb-4" style={{ fontFamily: F_BODY }}>
          <span className="text-sm" style={{ color: T.muted }}>Retain</span>
          <input type="range" min="0" max="30" value={uplift} onChange={(e) => setUplift(+e.target.value)} style={{ flex: 1 }} />
          <span style={{ fontFamily: F_MONO, fontWeight: 600, color: T.ink }}>{uplift}%</span>
          <span className="text-sm" style={{ color: T.muted }}>of expected leavers</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg p-3" style={{ background: T.bg }}><div className="text-xs" style={{ color: T.muted }}>Students in scope</div><div className="text-xl" style={{ fontFamily: F_MONO, fontWeight: 600 }}>{num(students)}</div></div>
          <div className="rounded-lg p-3" style={{ background: T.bg }}><div className="text-xs" style={{ color: T.muted }}>Expected dropouts</div><div className="text-xl" style={{ fontFamily: F_MONO, fontWeight: 600 }}>{num(drops)}</div></div>
          <div className="rounded-lg p-3" style={{ background: T.lowSoft }}><div className="text-xs" style={{ color: T.low }}>Students retained</div><div className="text-xl" style={{ fontFamily: F_MONO, fontWeight: 700, color: T.low }}>{num(retained)}</div></div>
        </div>
        <p className="text-xs mt-3" style={{ color: T.muted, fontFamily: F_BODY }}>Scenario, not a forecast. The data is observational; replace the percentage with results from a pilot.</p>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recs.map((r) => (
          <div key={r.t} className="rounded-xl p-4 flex gap-3" style={{ background: T.card, border: `1px solid ${T.line}` }}>
            <r.icon size={20} color={T.deep2} className="shrink-0 mt-1" />
            <div><div style={{ fontFamily: F_DISPLAY, fontWeight: 600, color: T.ink }}>{r.t}</div>
              <div className="text-sm mt-1" style={{ fontFamily: F_BODY, color: T.muted }}>{r.d}</div></div>
          </div>))}
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("overview");
  const tabs = [["overview", "Overview"], ["drivers", "Driver Explorer"], ["triage", "Risk Triage"], ["equity", "Equity Audit"], ["actions", "Action Plan"]];
  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: F_BODY }}>
      <Fonts />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="rounded-2xl p-6 mb-5" style={{ background: `linear-gradient(135deg, ${T.deep}, ${T.deep2})` }}>
          <div className="text-xs uppercase tracking-widest mb-1" style={{ color: T.mod, fontWeight: 600 }}>Retention analytics</div>
          <div className="text-3xl sm:text-4xl" style={{ color: "#fff", fontFamily: F_DISPLAY, fontWeight: 700 }}>Student Dropout Risk 2026</div>
          <div className="text-sm mt-1" style={{ color: "#B5D3D1" }}>{num(D.meta.students)} students · {pct(OVERALL)} dropout · risk scores are out-of-fold, protected attributes excluded</div>
        </div>
        <div className="flex flex-wrap gap-2 mb-5">
          {tabs.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className="px-4 py-2 rounded-lg text-sm whitespace-nowrap"
              style={{ fontFamily: F_BODY, fontWeight: 600, background: tab === id ? T.deep : "transparent", color: tab === id ? "#fff" : T.muted, border: `1px solid ${tab === id ? T.deep : T.line}` }}>{label}</button>))}
        </div>
        {tab === "overview" && <Overview />}{tab === "drivers" && <Drivers />}{tab === "triage" && <Triage />}{tab === "equity" && <Equity />}{tab === "actions" && <Actions />}
        <div className="text-center text-xs mt-8 pb-4" style={{ color: T.muted }}>Aggregates generated from student_clean.csv. Observational data: associations, not causal effects. Likely simulated dataset; validate on real records.</div>
      </div>
    </div>
  );
}
