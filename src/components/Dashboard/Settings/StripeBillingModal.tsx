@@ .. @@
 import React, { useEffect } from 'react';
 import { X, CreditCard, ArrowUpRight, Building2, Link2, CheckCircle2, Code, Copy, ExternalLink, Book, DollarSign, PenSquare, Plus, BarChart2, Link as LinkIcon } from 'lucide-react';
-import { EditPlanModal } from './EditPlanModal';
 import { CreateInvoiceModal } from './CreateInvoiceModal';
-import { PlansPreviewModal } from './PlansPreviewModal';
 import { usePlans } from '../../../hooks/usePlans';

@@ .. @@
   const { plans, syncWithStripe } = usePlans();
   const [activeTab, setActiveTab] = React.useState<'overview' | 'plans' | 'invoices' | 'settings'>('overview');
-  const [showEditPlan, setShowEditPlan] = React.useState(false);
-  const [selectedPlan, setSelectedPlan] = React.useState<any>(null);
   const [showCreateInvoice, setShowCreateInvoice] = React.useState(false);
-  const [showPlansPreview, setShowPlansPreview] = React.useState(false);
   const [selectedInvoice, setSelectedInvoice] = React.useState<any>(null);

@@ .. @@
   // Sync with Stripe on mount
   useEffect(() => {
     syncWithStripe();
   }, [syncWithStripe]);

-  const handleEditPlan = (plan: any) => {
-    setSelectedPlan(plan);
-    setShowEditPlan(true);
-  };
-
-  const handlePlanUpdate = async (planId: string, newPrice: string) => {
-    // In a real app, this would update the plan price in Stripe
-    console.log(`Updating plan ${planId} to ${newPrice}`);
-    setShowEditPlan(false);
-  };
-
   const handleCreateInvoice = async (invoiceData: any) => {
     // In a real app, this would create a new invoice in Stripe
     console.log('Creating invoice:', invoiceData);
     setShowCreateInvoice(false);
   };

@@ .. @@
               </div>
             </div>
           )}
 
-          {activeTab === 'plans' && (
-            <div className="p-6 space-y-6">
-              <div className="flex justify-between items-center">
-                <h3 className="text-lg font-bold text-white">Subscription Plans</h3>
-                <div className="flex items-center space-x-4">
-                  <button
-                    onClick={() => setShowPlansPreview(true)}
-                    className="text-[#635BFF] hover:text-[#635BFF]/80 text-sm flex items-center space-x-1"
-                  >
-                    <span>Preview Plans</span>
-                    <ArrowUpRight className="w-4 h-4" />
-                  </button>
-                  <a
-                    href="https://dashboard.stripe.com/products"
-                    target="_blank"
-                    rel="noopener noreferrer"
-                    className="text-[#635BFF] hover:text-[#635BFF]/80 text-sm flex items-center space-x-1"
-                  >
-                    <span>Manage in Stripe</span>
-                    <ExternalLink className="w-4 h-4" />
-                  </a>
-                </div>
-              </div>
-
-              <div className="grid gap-6">
-                {plans.map((plan) => (
-                  <div key={plan.id} className="bg-zinc-800/50 rounded-xl border border-[#B38B3F]/20 p-4">
-                    <div className="flex items-center justify-between">
-                      <div>
-                        <h4 className="text-white font-medium">{plan.name}</h4>
-                        <div className="text-2xl font-bold text-[#635BFF] mt-1">{plan.price}</div>
-                      </div>
-                      <button
-                        onClick={() => handleEditPlan(plan)}
-                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
-                      >
-                        <PenSquare className="w-5 h-5 text-white/60 hover:text-white" />
-                      </button>
-                    </div>
-                    <div className="grid grid-cols-2 gap-4 mt-4">
-                      <div>
-                        <div className="text-white/60 text-sm">Active Users</div>
-                        <div className="text-white font-medium mt-1">{plan.users}</div>
-                      </div>
-                      <div>
-                        <div className="text-white/60 text-sm">Monthly Revenue</div>
-                        <div className="text-white font-medium mt-1">{plan.revenue}</div>
-                      </div>
-                    </div>
-                  </div>
-                ))}
-              </div>
-            </div>
-          )}
-
           {activeTab === 'invoices' && (
             <div className="p-6 space-y-6">
               <div className="flex justify-between items-center">
                 <h3 className="text-lg font-bold text-white">Invoices</h3>
                 <div className="flex items-center space-x-4">
                   <a
                     href="https://dashboard.stripe.com/invoices"
                     target="_blank"
                     rel="noopener noreferrer"
                     className="text-[#635BFF] hover:text-[#635BFF]/80 text-sm flex items-center space-x-1"
                   >
                     <span>View in Stripe</span>
                     <ExternalLink className="w-4 h-4" />
                   </a>
                   <button
                     onClick={() => setShowCreateInvoice(true)}
                     className="flex items-center space-x-2 px-4 py-2 bg-[#635BFF] text-white rounded-lg hover:bg-[#635BFF]/90 transition-colors"
                   >
                     <Plus className="w-4 h-4" />
                     <span>Create Invoice</span>
                   </button>
                 </div>
               </div>

@@ .. @@
           </div>
         </div>
       </div>
 
-      {showEditPlan && selectedPlan && (
-        <EditPlanModal
-          plan={selectedPlan}
-          onClose={() => setShowEditPlan(false)}
-          onSave={handlePlanUpdate}
-        />
-      )}
-
       {showCreateInvoice && (
         <CreateInvoiceModal
           onClose={() => setShowCreateInvoice(false)}
           onSave={handleCreateInvoice}
         />
       )}
-      
-      {showPlansPreview && (
-        <PlansPreviewModal onClose={() => setShowPlansPreview(false)} />
-      )}
     </div>
   );
 }