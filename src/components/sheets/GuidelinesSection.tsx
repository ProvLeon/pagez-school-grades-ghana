import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle } from "lucide-react";

export const GuidelinesSection = () => {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Upload Guidelines for Ghana Basic Schools
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">Student Registration</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Download template first from Templates tab</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Include Ghana Card Number (if available)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Guardian contact information required</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Use proper date format (DD/MM/YYYY)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Include residential address with Ghana region</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Results Upload</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Use template with pre-filled student data</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Follow GES assessment format</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Include all SBA components (CA1-CA4)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Marks should be numerical (0-100)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Ensure student IDs match exactly</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Template Features
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">Ghana-Specific Features</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Phone number validation (+233 format)</li>
              <li>• Ghana region-aware address fields</li>
              <li>• GES-compliant assessment structure</li>
              <li>• Academic year formatting (2024/2025)</li>
              <li>• Guardian information requirements</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Template Benefits</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Pre-filled class and department information</li>
              <li>• Data validation and dropdown lists</li>
              <li>• Detailed instructions and examples</li>
              <li>• Error prevention through formatting</li>
              <li>• Bulk processing capabilities</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
