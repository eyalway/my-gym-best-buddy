-- Remove the dangerous public access policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a secure policy that only allows users to view their own profile  
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Also add a policy to allow users to view other users' basic info ONLY if we need it for the app
-- (Commented out for now - only enable if the app specifically needs to show other users' names)
-- CREATE POLICY "Users can view basic info of other users"
-- ON public.profiles
-- FOR SELECT
-- USING (true)
-- WITH (full_name); -- This would limit to only full_name column if supported