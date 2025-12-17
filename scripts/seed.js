
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 1. Load .env manually to avoid dependency issues
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error('.env file not found!');
  process.exit(1);
}

const envConfig = fs.readFileSync(envPath, 'utf8');
const env = {};
envConfig.split('\n').forEach(line => {
  // Remove inline comments
  const cleanLine = line.split('#')[0].trim();
  if (!cleanLine) return;

  const [key, ...valueParts] = cleanLine.split('=');
  if (key && valueParts.length > 0) {
    const value = valueParts.join('=').trim(); // Join back in case value has =
    env[key.trim()] = value.replace(/^["']|["']$/g, ''); // remove quotes
  }
});

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_KEY;
const ANON_KEY = env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || (!SERVICE_KEY && !ANON_KEY)) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

console.log(`Connecting to Supabase at ${SUPABASE_URL}...`);

async function getClient() {
  if (SERVICE_KEY) {
    console.log('Using Service Role Key (Bypassing RLS)...');
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Create the admin user if not exists
    const email = 'admin@example.com';
    const password = 'password123';

    try {
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers.users.find(user => user.email === email);

      if (!existingUser) {
        console.log('Creating admin user...');
        const { data, error } = await supabase.auth.admin.createUser({
          email,
          password,
          user_metadata: { full_name: 'Seed Admin', role: 'admin' },
          email_confirm: true // Auto-confirm email
        });

        if (error) {
          console.error('Failed to create admin user:', error);
        } else {
          console.log('Admin user created successfully.');

          // Create profile for the admin user
          const userId = data.user.id;
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              user_id: userId,
              user_type: 'admin'
            }, { onConflict: 'user_id' });

          if (profileError) {
            console.error('Failed to create admin profile:', profileError);
          } else {
            console.log('Admin profile created successfully.');
          }
        }
      } else {
        console.log('Admin user already exists. Updating password...');
        const { error } = await supabase.auth.admin.updateUserById(existingUser.id, {
          password,
          email_confirm: true
        });

        if (error) {
          console.error('Failed to update admin user:', error);
        } else {
          console.log('Admin user updated successfully.');

          // Ensure profile exists for the admin user
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              user_id: existingUser.id,
              user_type: 'admin'
            }, { onConflict: 'user_id' });

          if (profileError) {
            console.error('Failed to create/update admin profile:', profileError);
          } else {
            console.log('Admin profile ensured.');
          }
        }
      }
    } catch (error) {
      console.error('Error checking/creating admin user:', error);
    }

    return supabase;
  }

  console.log('Using Anon Key. Attempting to authenticate as seed user...');
  const supabase = createClient(SUPABASE_URL, ANON_KEY);

  const email = 'providence.leonard@gmail.com';
  const password = 'etc8r8e@Bleon';

  const { data: { session }, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (session) {
    console.log('Authenticated as existing admin user.');
    return supabase;
  }

  console.log('Admin user not found or login failed. Attempting to create...');
  const { data: { session: newSession }, error: signupError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: 'Seed Admin', role: 'admin' }
    }
  });

  if (signupError) {
    console.error(`Authentication failed: ${signupError.message}`);
    throw signupError;
  }

  if (newSession) {
    console.log('Created and authenticated as new admin user.');
    return supabase;
  }

  console.log('User created but email confirmation may be required. Trying to proceed (might fail if RLS requires confirmed email)...');
  return supabase;
}

async function ensureStorageBuckets(supabase) {
  console.log('Ensuring storage buckets exist...');

  const buckets = [
    { id: 'signatures', name: 'signatures', public: true },
    { id: 'school-logos', name: 'school-logos', public: true },
    { id: 'student-photos', name: 'student-photos', public: true },
  ];

  for (const bucket of buckets) {
    const { data: existing } = await supabase.storage.getBucket(bucket.id);

    if (!existing) {
      const { error } = await supabase.storage.createBucket(bucket.id, {
        public: bucket.public,
      });

      if (error && !error.message.includes('already exists')) {
        console.warn(`Warning: Could not create bucket "${bucket.id}":`, error.message);
      } else {
        console.log(`  Created bucket: ${bucket.id}`);
      }
    } else {
      console.log(`  Bucket exists: ${bucket.id}`);
    }
  }
}

export async function seed() {
  try {
    const supabase = await getClient();

    // --- 0. Ensure Storage Buckets ---
    await ensureStorageBuckets(supabase);

    // --- 1. Departments ---
    console.log('Seeding Departments...');
    // Check existing departments to avoid duplicates
    const { data: existingDepts } = await supabase.from('departments').select('name');
    const existingDeptNames = new Set((existingDepts || []).map(d => d.name.toUpperCase()));

    const deptsToInsert = [
      { name: 'KG', description: 'Kindergarten Department' },
      { name: 'PRIMARY', description: 'Primary School Department' },
      { name: 'JUNIOR HIGH', description: 'Junior High School Department' },
      { name: 'SENIOR HIGH', description: 'Senior High School Department' }
    ].filter(d => !existingDeptNames.has(d.name.toUpperCase()));

    if (deptsToInsert.length > 0) {
      const { error: deptInsertError } = await supabase
        .from('departments')
        .insert(deptsToInsert)
        .select();
      if (deptInsertError) console.warn(`Departments Warning: ${deptInsertError.message}`);
      else console.log(`✓ Inserted ${deptsToInsert.length} new departments`);
    } else {
      console.log('✓ Departments already exist, skipping');
    }

    // Re-fetch all departments to get IDs
    const { data: depts, error: deptError } = await supabase
      .from('departments')
      .select('*');

    if (deptError) throw new Error(`Departments Error: ${deptError.message}`);
    const kgDept = depts.find(d => d.name === 'KG');
    const primaryDept = depts.find(d => d.name === 'PRIMARY');
    const jhsDept = depts.find(d => d.name === 'JUNIOR HIGH');
    const shsDept = depts.find(d => d.name === 'SENIOR HIGH');

    // --- 2. Teachers ---
    console.log('Seeding Teachers...');

    // Create a test teacher with auth user and profile (for testing teacher login)
    const testTeacherEmail = 'teacher@example.com';
    const testTeacherPassword = 'teacher123';
    let testTeacherUserId = null;

    try {
      // Check if test teacher auth user exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingTeacherUser = existingUsers?.users?.find(user => user.email === testTeacherEmail);

      if (!existingTeacherUser) {
        console.log('Creating test teacher auth user...');
        const { data: teacherAuthData, error: teacherAuthError } = await supabase.auth.admin.createUser({
          email: testTeacherEmail,
          password: testTeacherPassword,
          user_metadata: { full_name: 'Test Teacher', role: 'teacher' },
          email_confirm: true
        });

        if (teacherAuthError) {
          console.error('Failed to create test teacher auth user:', teacherAuthError);
        } else {
          testTeacherUserId = teacherAuthData.user.id;
          console.log('Test teacher auth user created successfully.');

          // Create profile for the test teacher
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              user_id: testTeacherUserId,
              user_type: 'teacher'
            }, { onConflict: 'user_id' });

          if (profileError) {
            console.error('Failed to create test teacher profile:', profileError);
          } else {
            console.log('Test teacher profile created successfully.');
          }
        }
      } else {
        testTeacherUserId = existingTeacherUser.id;
        console.log('Test teacher auth user already exists. Ensuring profile exists...');

        // Ensure profile exists
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: testTeacherUserId,
            user_type: 'teacher'
          }, { onConflict: 'user_id' });

        if (profileError) {
          console.error('Failed to create/update test teacher profile:', profileError);
        } else {
          console.log('Test teacher profile ensured.');
        }
      }
    } catch (error) {
      console.error('Error creating test teacher user:', error);
    }

    // Seed teachers (including linking test teacher to auth user)
    const teachersData = [
      { full_name: 'Test Teacher', email: testTeacherEmail, phone: '0200000000', department_id: primaryDept?.id, user_id: testTeacherUserId },
      { full_name: 'Kwame Mensah', email: 'kwame.mensah@example.com', phone: '0244123456', department_id: primaryDept?.id },
      { full_name: 'Ama Osei', email: 'ama.osei@example.com', phone: '0208987654', department_id: jhsDept?.id },
      { full_name: 'John Doe', email: 'john.doe@example.com', phone: '0501234567', department_id: primaryDept?.id },
      { full_name: 'Grace Asante', email: 'grace.asante@example.com', phone: '0271234567', department_id: shsDept?.id }
    ];

    const { data: teachers, error: teachError } = await supabase
      .from('teachers')
      .upsert(teachersData, { onConflict: 'email' })
      .select();

    if (teachError) throw new Error(`Teachers Error: ${teachError.message}`);
    console.log(`Seeded ${teachers?.length || 0} teachers. Test teacher login: ${testTeacherEmail} / ${testTeacherPassword}`);

    // --- 3. Classes ---
    console.log('Seeding Classes...');
    // First, check existing classes to avoid duplicates
    const { data: existingClasses } = await supabase.from('classes').select('name, department_id');
    const existingClassKeys = new Set(
      (existingClasses || []).map(c => `${c.name}|${c.department_id}`)
    );

    const classesToInsert = [
      { name: 'KG 1', department_id: kgDept?.id, academic_year: '2023/2024' },
      { name: 'KG 2', department_id: kgDept?.id, academic_year: '2023/2024' },
      { name: 'Class 1', department_id: primaryDept?.id, academic_year: '2023/2024' },
      { name: 'Class 2', department_id: primaryDept?.id, academic_year: '2023/2024' },
      { name: 'Class 3', department_id: primaryDept?.id, academic_year: '2023/2024' },
      { name: 'Class 4', department_id: primaryDept?.id, academic_year: '2023/2024' },
      { name: 'Class 5', department_id: primaryDept?.id, academic_year: '2023/2024' },
      { name: 'Class 6', department_id: primaryDept?.id, academic_year: '2023/2024' },
      { name: 'JHS 1', department_id: jhsDept?.id, academic_year: '2023/2024' },
      { name: 'JHS 2', department_id: jhsDept?.id, academic_year: '2023/2024' },
      { name: 'JHS 3', department_id: jhsDept?.id, academic_year: '2023/2024' },
      { name: 'SHS 1', department_id: shsDept?.id, academic_year: '2023/2024' },
      { name: 'SHS 2', department_id: shsDept?.id, academic_year: '2023/2024' },
      { name: 'SHS 3', department_id: shsDept?.id, academic_year: '2023/2024' }
    ].filter(c => !existingClassKeys.has(`${c.name}|${c.department_id}`));

    if (classesToInsert.length > 0) {
      const { error: classError } = await supabase
        .from('classes')
        .insert(classesToInsert)
        .select();
      if (classError) console.warn(`Classes Warning: ${classError.message}`);
      else console.log(`✓ Inserted ${classesToInsert.length} new classes`);
    } else {
      console.log('✓ Classes already exist, skipping');
    }

    // Re-fetch classes to be sure we have IDs
    const { data: fetchedClasses } = await supabase.from('classes').select('*');
    const kg1 = fetchedClasses.find(c => c.name === 'KG 1');
    const class1 = fetchedClasses.find(c => c.name === 'Class 1');
    const class2 = fetchedClasses.find(c => c.name === 'Class 2');
    const jhs1 = fetchedClasses.find(c => c.name === 'JHS 1');
    const shs1 = fetchedClasses.find(c => c.name === 'SHS 1');

    // --- 4. Subjects ---
    console.log('Seeding Subjects...');
    // Seed CA Types (assessment configurations)
    const { data: existingCATypes } = await supabase.from('ca_types').select('name');
    const existingCATypeNames = new Set((existingCATypes || []).map(c => c.name.toLowerCase()));

    const caTypesToInsert = [
      {
        name: 'SBA 30/70',
        description: 'School-Based Assessment with 30% CA and 70% Exam',
        configuration: { ca: 30, exam: 70 }
      },
      {
        name: 'SBA 40/60',
        description: 'School-Based Assessment with 40% CA and 60% Exam',
        configuration: { ca: 40, exam: 60 }
      },
      {
        name: 'SBA 50/50',
        description: 'School-Based Assessment with 50% CA and 50% Exam',
        configuration: { ca: 50, exam: 50 }
      },
      {
        name: 'CA Only',
        description: 'Continuous Assessment Only (100% CA)',
        configuration: { ca1: 25, ca2: 25, ca3: 25, ca4: 25 }
      },
      {
        name: '4-CA Split',
        description: 'Four Continuous Assessments with Exam',
        configuration: { ca1: 10, ca2: 10, ca3: 10, ca4: 10, exam: 60 }
      }
    ].filter(c => !existingCATypeNames.has(c.name.toLowerCase()));

    if (caTypesToInsert.length > 0) {
      const { error: caTypeError } = await supabase
        .from('ca_types')
        .insert(caTypesToInsert)
        .select();
      if (caTypeError) console.warn(`CA Types Warning: ${caTypeError.message}`);
      else console.log(`✓ Inserted ${caTypesToInsert.length} CA types`);
    } else {
      console.log('✓ CA Types already exist, skipping');
    }

    // Check existing subjects to avoid duplicates
    const { data: existingSubjects } = await supabase.from('subjects').select('name, department_id');
    const existingSubjectKeys = new Set(
      (existingSubjects || []).map(s => `${s.name}|${s.department_id}`)
    );

    const subjectsData = [
      // KG Subjects (prefix: KG-)
      { name: 'Numeracy', code: 'KG-NUM', department_id: kgDept?.id },
      { name: 'Literacy', code: 'KG-LIT', department_id: kgDept?.id },
      { name: 'Creative Arts', code: 'KG-CA', department_id: kgDept?.id },
      // PRIMARY Subjects (prefix: PRI-)
      { name: 'Mathematics', code: 'PRI-MATH', department_id: primaryDept?.id },
      { name: 'English Language', code: 'PRI-ENG', department_id: primaryDept?.id },
      { name: 'Science', code: 'PRI-SCI', department_id: primaryDept?.id },
      { name: 'Social Studies', code: 'PRI-SS', department_id: primaryDept?.id },
      { name: 'Religious & Moral Education', code: 'PRI-RME', department_id: primaryDept?.id },
      { name: 'French', code: 'PRI-FRE', department_id: primaryDept?.id },
      // JUNIOR HIGH Subjects (prefix: JHS-)
      { name: 'Mathematics', code: 'JHS-MATH', department_id: jhsDept?.id },
      { name: 'English Language', code: 'JHS-ENG', department_id: jhsDept?.id },
      { name: 'Integrated Science', code: 'JHS-ISCI', department_id: jhsDept?.id },
      { name: 'Social Studies', code: 'JHS-SS', department_id: jhsDept?.id },
      { name: 'RME', code: 'JHS-RME', department_id: jhsDept?.id },
      { name: 'ICT', code: 'JHS-ICT', department_id: jhsDept?.id },
      { name: 'Basic Design & Technology', code: 'JHS-BDT', department_id: jhsDept?.id },
      // SENIOR HIGH Subjects (prefix: SHS-)
      { name: 'Core Mathematics', code: 'SHS-CMATH', department_id: shsDept?.id },
      { name: 'Core English', code: 'SHS-CENG', department_id: shsDept?.id },
      { name: 'Core Science', code: 'SHS-CSCI', department_id: shsDept?.id },
      { name: 'Social Studies', code: 'SHS-SS', department_id: shsDept?.id },
      { name: 'Elective Mathematics', code: 'SHS-EMATH', department_id: shsDept?.id },
      { name: 'Physics', code: 'SHS-PHY', department_id: shsDept?.id },
      { name: 'Chemistry', code: 'SHS-CHEM', department_id: shsDept?.id },
      { name: 'Biology', code: 'SHS-BIO', department_id: shsDept?.id }
    ];

    const subjectsToInsert = subjectsData.filter(
      s => !existingSubjectKeys.has(`${s.name}|${s.department_id}`)
    );

    let subjects = existingSubjects || [];
    if (subjectsToInsert.length > 0) {
      const { data: newSubjects, error: subjError } = await supabase
        .from('subjects')
        .insert(subjectsToInsert)
        .select();
      if (subjError) console.warn(`Subjects Warning: ${subjError.message}`);
      else {
        console.log(`✓ Inserted ${subjectsToInsert.length} new subjects`);
        subjects = [...subjects, ...(newSubjects || [])];
      }
    } else {
      console.log('✓ Subjects already exist, skipping');
    }

    // Re-fetch all subjects
    const { data: allSubjects, error: subjError } = await supabase.from('subjects').select('*');
    subjects = allSubjects || [];

    if (subjError) console.warn(`Subjects fetch warning: ${subjError.message}`);
    const mathSubj = subjects.find(s => s.code === 'PRI-MATH' || s.code === 'JHS-MATH');
    const engSubj = subjects.find(s => s.code === 'PRI-ENG' || s.code === 'JHS-ENG');

    // --- 5. Students ---
    console.log('Seeding Students...');
    // Check existing students to avoid duplicates
    const { data: existingStudents } = await supabase.from('students').select('student_id');
    const existingStudentIds = new Set((existingStudents || []).map(s => s.student_id));

    const studentsData = [
      // KG Students
      { student_id: 'STU001', full_name: 'Kwame Asante', gender: 'male', date_of_birth: '2015-03-15', class_id: kg1?.id, department_id: kgDept?.id, academic_year: '2023/2024', has_left: false },
      // PRIMARY Students
      { student_id: 'STU005', full_name: 'Yaw Owusu', gender: 'male', date_of_birth: '2010-09-03', class_id: jhs1?.id, department_id: jhsDept?.id, academic_year: '2023/2024', has_left: false },
      { student_id: 'STU006', full_name: 'Abena Sarpong', gender: 'female', date_of_birth: '2010-12-25', class_id: jhs1?.id, department_id: jhsDept?.id, academic_year: '2023/2024', has_left: false },
      { student_id: 'STU004', full_name: 'Akosua Darko', gender: 'female', date_of_birth: '2013-05-18', class_id: class2?.id, department_id: primaryDept?.id, academic_year: '2023/2024', has_left: false },
      // JUNIOR HIGH Students
      { student_id: 'ST005', full_name: 'Akosua Manu', gender: 'female', date_of_birth: '2012-11-30', class_id: jhs1?.id, department_id: jhsDept?.id, academic_year: '2023/2024', has_left: false },
      { student_id: 'ST006', full_name: 'Kwame Asante', gender: 'male', date_of_birth: '2012-06-18', class_id: jhs1?.id, department_id: jhsDept?.id, academic_year: '2023/2024', has_left: false },
      // SENIOR HIGH Students
      { student_id: 'STU007', full_name: 'Kwaku Frimpong', gender: 'male', date_of_birth: '2007-04-08', class_id: shs1?.id, department_id: shsDept?.id, academic_year: '2023/2024', has_left: false },
      { student_id: 'STU008', full_name: 'Adwoa Gyamfi', gender: 'female', date_of_birth: '2007-08-14', class_id: shs1?.id, department_id: shsDept?.id, academic_year: '2023/2024', has_left: false }
    ];

    const studentsToInsert = studentsData.filter(s => !existingStudentIds.has(s.student_id));

    let students = existingStudents || [];
    if (studentsToInsert.length > 0) {
      const { data: newStudents, error: studError } = await supabase
        .from('students')
        .insert(studentsToInsert)
        .select();
      if (studError) console.warn(`Students Warning: ${studError.message}`);
      else {
        console.log(`✓ Inserted ${studentsToInsert.length} new students`);
        students = [...students, ...(newStudents || [])];
      }
    } else {
      console.log('✓ Students already exist, skipping');
    }

    // Re-fetch all students
    const { data: allStudents, error: studError } = await supabase.from('students').select('*');
    students = allStudents || [];

    if (studError) console.warn(`Students fetch warning: ${studError.message}`);
    const st002 = students.find(s => s.student_id === 'STU002');

    // --- 6. Comment Options (for Conduct, Attitude, Interest, Teacher Comments) ---
    console.log('Seeding Comment Options...');
    const { data: existingCommentOptions } = await supabase.from('comment_options').select('option_type, option_value');
    const existingCommentKeys = new Set(
      (existingCommentOptions || []).map(c => `${c.option_type}|${c.option_value}`)
    );

    const commentOptionsData = [
      // Conduct options
      { option_type: 'conduct', option_value: 'Excellent', sort_order: 1 },
      { option_type: 'conduct', option_value: 'Very Good', sort_order: 2 },
      { option_type: 'conduct', option_value: 'Good', sort_order: 3 },
      { option_type: 'conduct', option_value: 'Satisfactory', sort_order: 4 },
      { option_type: 'conduct', option_value: 'Needs Improvement', sort_order: 5 },
      // Attitude options
      { option_type: 'attitude', option_value: 'Excellent', sort_order: 1 },
      { option_type: 'attitude', option_value: 'Very Good', sort_order: 2 },
      { option_type: 'attitude', option_value: 'Good', sort_order: 3 },
      { option_type: 'attitude', option_value: 'Satisfactory', sort_order: 4 },
      { option_type: 'attitude', option_value: 'Needs Improvement', sort_order: 5 },
      // Interest options
      { option_type: 'interest', option_value: 'Excellent', sort_order: 1 },
      { option_type: 'interest', option_value: 'Very Good', sort_order: 2 },
      { option_type: 'interest', option_value: 'Good', sort_order: 3 },
      { option_type: 'interest', option_value: 'Satisfactory', sort_order: 4 },
      { option_type: 'interest', option_value: 'Needs Improvement', sort_order: 5 },
      // Teacher comment options
      { option_type: 'teacher', option_value: 'An excellent performance. Keep it up!', sort_order: 1 },
      { option_type: 'teacher', option_value: 'Very good performance. Well done!', sort_order: 2 },
      { option_type: 'teacher', option_value: 'Good performance. Can do better with more effort.', sort_order: 3 },
      { option_type: 'teacher', option_value: 'Satisfactory performance. Needs to work harder.', sort_order: 4 },
      { option_type: 'teacher', option_value: 'Fair performance. Must improve in all subjects.', sort_order: 5 },
      { option_type: 'teacher', option_value: 'Needs significant improvement. Requires extra attention.', sort_order: 6 },
    ];

    const commentOptionsToInsert = commentOptionsData.filter(
      c => !existingCommentKeys.has(`${c.option_type}|${c.option_value}`)
    );

    if (commentOptionsToInsert.length > 0) {
      const { error: commentError } = await supabase
        .from('comment_options')
        .insert(commentOptionsToInsert)
        .select();
      if (commentError) console.warn(`Comment Options Warning: ${commentError.message}`);
      else console.log(`✓ Inserted ${commentOptionsToInsert.length} comment options`);
    } else {
      console.log('✓ Comment Options already exist, skipping');
    }

    // --- 7. Grading Settings ---
    console.log('Seeding Grading Settings...');
    const { error: gradeError } = await supabase
      .from('grading_settings')
      .upsert([
        { academic_year: '2023/2024', term: 'First Term', is_active: true, term_begin: '2023-09-01', term_ends: '2023-12-15' }
      ], { onConflict: 'academic_year,term' })
      .select();

    if (gradeError) console.warn(`Grading Settings Warning: ${gradeError.message}`);

    // --- 8. Results ---
    console.log('Seeding Results...');
    // Check if result exists first to avoid complexity
    const { data: existingResults } = await supabase
      .from('results')
      .select('id')
      .match({ student_id: st002?.id, academic_year: '2023/2024', term: 'First Term' });

    let resultId;

    if (existingResults && existingResults.length > 0) {
      resultId = existingResults[0].id;
      console.log('Result already exists for ST002');
    } else if (st002) {
      const { data: newResult, error: resError } = await supabase
        .from('results')
        .insert({
          student_id: st002.id,
          class_id: st002.class_id,
          term: 'first',
          academic_year: '2023/2024',
          is_public: true
        })
        .select()
        .single();

      if (resError) throw new Error(`Results Error: ${resError.message}`);
      resultId = newResult.id;
    }

    // --- 8. Subject Marks ---
    console.log('Seeding Subject Marks...');

    // Check which columns exist in subject_marks table
    // Try with the newer schema first (ca1_score, etc.), fall back to older schema (score)
    const marksDataNew = [
      { result_id: resultId, subject_id: mathSubj?.id, ca1_score: 30, exam_score: 60, total_score: 90, grade: 'A' },
      { result_id: resultId, subject_id: engSubj?.id, ca1_score: 25, exam_score: 55, total_score: 80, grade: 'B+' }
    ];

    const marksDataOld = [
      { result_id: resultId, subject_id: mathSubj?.id, score: 90, grade: 'A' },
      { result_id: resultId, subject_id: engSubj?.id, score: 80, grade: 'B+' }
    ];

    // Need to handle upsert carefully for marks
    for (let i = 0; i < marksDataNew.length; i++) {
      const markNew = marksDataNew[i];
      const markOld = marksDataOld[i];

      if (!markNew.result_id || !markNew.subject_id) {
        console.log('Skipping mark - missing result_id or subject_id');
        continue;
      }

      const { data: existingMark } = await supabase
        .from('subject_marks')
        .select('id')
        .match({ result_id: markNew.result_id, subject_id: markNew.subject_id });

      if (!existingMark || existingMark.length === 0) {
        // Try new schema first
        const { error: markErrorNew } = await supabase.from('subject_marks').insert(markNew);

        if (markErrorNew && markErrorNew.message.includes('ca1_score')) {
          // Fall back to old schema (score column only)
          console.log('Using older subject_marks schema (score column)...');
          const { error: markErrorOld } = await supabase.from('subject_marks').insert(markOld);
          if (markErrorOld) console.error(`Error inserting mark (old schema): ${markErrorOld.message}`);
        } else if (markErrorNew) {
          console.error(`Error inserting mark: ${markErrorNew.message}`);
        }
      }
    }

    console.log('Seeding completed successfully!');
    console.log('');
    console.log('===========================================');
    console.log('LOGIN CREDENTIALS FOR TESTING:');
    console.log('===========================================');
    console.log('Admin User:');
    console.log('  Email:    admin@example.com');
    console.log('  Password: password123');
    console.log('');
    console.log('Teacher User:');
    console.log('  Email:    teacher@example.com');
    console.log('  Password: teacher123');
    console.log('===========================================');

  } catch (err) {
    console.error('Seeding Failed:', err);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed();
}
