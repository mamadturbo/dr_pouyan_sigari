import 'server-only';
import {publicCases} from '@/lib/cases';
// Empty until actual before/after media and publication authorization are verified.
// Keep consent records and all patient identifiers outside the repository and public/.
// Put approved, de-identified media only in public/assets/cases/.
const records:unknown[]=[];
export const approvedCases=publicCases(records);
