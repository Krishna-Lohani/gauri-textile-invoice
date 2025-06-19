// Invoice Generator App Script
let itemCount = 0;
let currentInvoice = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set default date to today
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
    
    // Set default invoice number
    document.getElementById('invoiceNumber').value = generateInvoiceNumber();
    
    // Add first item
    addItem();
    
    // Event listeners
    document.getElementById('createTab').addEventListener('click', () => switchTab('create'));
    document.getElementById('previewTab').addEventListener('click', () => switchTab('preview'));
    document.getElementById('addItem').addEventListener('click', addItem);
    document.getElementById('invoiceForm').addEventListener('submit', createInvoice);
    document.getElementById('printBtn').addEventListener('click', printInvoice);
    document.getElementById('shareBtn').addEventListener('click', shareInvoice);
}

function switchTab(tab) {
    const createTab = document.getElementById('createTab');
    const previewTab = document.getElementById('previewTab');
    const createContent = document.getElementById('createContent');
    const previewContent = document.getElementById('previewContent');
    
    if (tab === 'create') {
        createTab.classList.add('border-primary', 'bg-primary/5', 'text-primary', 'font-medium');
        createTab.classList.remove('border-transparent', 'text-gray-600');
        previewTab.classList.add('border-transparent', 'text-gray-600');
        previewTab.classList.remove('border-primary', 'bg-primary/5', 'text-primary', 'font-medium');
        createContent.classList.remove('hidden');
        previewContent.classList.add('hidden');
    } else {
        previewTab.classList.add('border-primary', 'bg-primary/5', 'text-primary', 'font-medium');
        previewTab.classList.remove('border-transparent', 'text-gray-600');
        createTab.classList.add('border-transparent', 'text-gray-600');
        createTab.classList.remove('border-primary', 'bg-primary/5', 'text-primary', 'font-medium');
        previewContent.classList.remove('hidden');
        createContent.classList.add('hidden');
    }
}

function generateInvoiceNumber() {
    const currentYear = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-3);
    return `INV-${currentYear}-${timestamp}`;
}

function addItem() {
    itemCount++;
    const container = document.getElementById('itemsContainer');
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'border rounded-lg p-3 bg-white/50';
    itemDiv.innerHTML = `
        <div class="grid grid-cols-2 gap-3 mb-3">
            <div>
                <label class="block text-xs font-medium mb-1">Description</label>
                <input type="text" class="item-description w-full p-2 text-sm border border-gray-300 rounded" placeholder="Item description">
            </div>
            <div>
                <label class="block text-xs font-medium mb-1">HSN Code</label>
                <input type="text" class="item-hsn w-full p-2 text-sm border border-gray-300 rounded" placeholder="HSN code">
            </div>
        </div>
        <div class="grid grid-cols-3 gap-3 mb-3">
            <div>
                <label class="block text-xs font-medium mb-1">Bale No.</label>
                <input type="text" class="item-bale w-full p-2 text-sm border border-gray-300 rounded" placeholder="Bale number">
            </div>
            <div>
                <label class="block text-xs font-medium mb-1">Qty</label>
                <input type="number" class="item-quantity w-full p-2 text-sm border border-gray-300 rounded" placeholder="Quantity" step="0.01" value="1">
            </div>
            <div>
                <label class="block text-xs font-medium mb-1">Rate</label>
                <input type="number" class="item-rate w-full p-2 text-sm border border-gray-300 rounded" placeholder="Rate" step="0.01">
            </div>
        </div>
        <div class="flex justify-between items-center">
            <div class="text-sm font-semibold">
                Amount: ₹<span class="item-amount">0.00</span>
            </div>
            ${itemCount > 1 ? `<button type="button" class="remove-item p-1 text-red-600 hover:bg-red-100 rounded" onclick="removeItem(this)">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
            </button>` : ''}
        </div>
    `;
    
    container.appendChild(itemDiv);
    
    // Add event listeners for calculation
    const quantityInput = itemDiv.querySelector('.item-quantity');
    const rateInput = itemDiv.querySelector('.item-rate');
    
    quantityInput.addEventListener('input', () => calculateItemAmount(itemDiv));
    rateInput.addEventListener('input', () => calculateItemAmount(itemDiv));
}

function removeItem(button) {
    button.closest('.border').remove();
    itemCount--;
}

function calculateItemAmount(itemDiv) {
    const quantity = parseFloat(itemDiv.querySelector('.item-quantity').value) || 0;
    const rate = parseFloat(itemDiv.querySelector('.item-rate').value) || 0;
    const amount = quantity * rate;
    
    itemDiv.querySelector('.item-amount').textContent = amount.toFixed(2);
}

function createInvoice(event) {
    event.preventDefault();
    
    // Collect form data
    const formData = new FormData(event.target);
    const items = collectItems();
    
    if (items.length === 0) {
        alert('Please add at least one item');
        return;
    }
    
    // Validate required fields
    const requiredFields = ['invoiceNumber', 'date', 'customerName', 'customerAddress'];
    for (const field of requiredFields) {
        if (!document.getElementById(field).value.trim()) {
            alert(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
            return;
        }
    }
    
    // Calculate totals
    const invoice = {
        invoiceNumber: document.getElementById('invoiceNumber').value,
        date: document.getElementById('date').value,
        customerName: document.getElementById('customerName').value,
        customerAddress: document.getElementById('customerAddress').value,
        customerGST: document.getElementById('customerGST').value,
        orderNumber: document.getElementById('orderNumber').value,
        dispatchedThrough: document.getElementById('dispatchedThrough').value,
        dispatchDocNo: document.getElementById('dispatchDocNo').value,
        destination: document.getElementById('destination').value,
        packingCharges: parseFloat(document.getElementById('packingCharges').value) || 0,
        cgstRate: parseFloat(document.getElementById('cgstRate').value) || 0,
        sgstRate: parseFloat(document.getElementById('sgstRate').value) || 0,
        igstRate: parseFloat(document.getElementById('igstRate').value) || 0,
        items: items
    };
    
    // Calculate totals
    const itemsTotal = items.reduce((sum, item) => sum + item.amount, 0);
    const subtotal = itemsTotal + invoice.packingCharges;
    const cgstAmount = (subtotal * invoice.cgstRate) / 100;
    const sgstAmount = (subtotal * invoice.sgstRate) / 100;
    const igstAmount = (subtotal * invoice.igstRate) / 100;
    const totalTax = cgstAmount + sgstAmount + igstAmount;
    const beforeRounding = subtotal + totalTax;
    const grandTotal = Math.round(beforeRounding);
    const roundOff = grandTotal - beforeRounding;
    
    invoice.subtotal = subtotal;
    invoice.cgstAmount = cgstAmount;
    invoice.sgstAmount = sgstAmount;
    invoice.igstAmount = igstAmount;
    invoice.roundOff = roundOff;
    invoice.grandTotal = grandTotal;
    invoice.amountInWords = numberToWords(grandTotal);
    
    currentInvoice = invoice;
    generatePreview(invoice);
    switchTab('preview');
}

function collectItems() {
    const items = [];
    const itemDivs = document.querySelectorAll('#itemsContainer .border');
    
    itemDivs.forEach((itemDiv, index) => {
        const description = itemDiv.querySelector('.item-description').value.trim();
        const hsnCode = itemDiv.querySelector('.item-hsn').value.trim();
        const baleNumber = itemDiv.querySelector('.item-bale').value.trim();
        const quantity = parseFloat(itemDiv.querySelector('.item-quantity').value) || 0;
        const rate = parseFloat(itemDiv.querySelector('.item-rate').value) || 0;
        
        if (description && hsnCode && quantity > 0 && rate > 0) {
            items.push({
                serialNumber: index + 1,
                description,
                hsnCode,
                baleNumber,
                quantity,
                rate,
                amount: quantity * rate
            });
        }
    });
    
    return items;
}

function generatePreview(invoice) {
    const previewDiv = document.getElementById('invoicePreview');
    const actionButtons = document.getElementById('actionButtons');
    
    previewDiv.innerHTML = `
        <div class="p-6">
            <!-- Header with Logo -->
            <div class="flex items-center justify-between mb-6 pb-4 border-b-2 border-purple-600">
                <div class="flex items-center space-x-4">
                    <div class="w-16 h-16 invoice-logo rounded-full flex items-center justify-center">
                        <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold text-purple-600">Gauri Textile</h1>
                        <p class="text-gray-600">Professional Invoice</p>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-3xl font-bold text-purple-600">INVOICE</div>
                    <div class="text-gray-600">No: ${invoice.invoiceNumber}</div>
                    <div class="text-gray-600">Date: ${formatDate(invoice.date)}</div>
                </div>
            </div>

            <!-- Customer and Order Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <h3 class="font-semibold text-gray-800 mb-2">Bill To:</h3>
                    <div class="text-gray-600">
                        <div class="font-medium text-gray-800">${invoice.customerName}</div>
                        <div class="mt-1 whitespace-pre-line">${invoice.customerAddress}</div>
                        ${invoice.customerGST ? `<div class="mt-1">GST NO: ${invoice.customerGST}</div>` : ''}
                    </div>
                </div>
                <div>
                    <h3 class="font-semibold text-gray-800 mb-2">Order Details:</h3>
                    <div class="text-gray-600 space-y-1">
                        ${invoice.orderNumber ? `<div>Order No: ${invoice.orderNumber}</div>` : ''}
                        ${invoice.dispatchedThrough ? `<div>Dispatched through: ${invoice.dispatchedThrough}</div>` : ''}
                        ${invoice.dispatchDocNo ? `<div>Dispatch Doc No: ${invoice.dispatchDocNo}</div>` : ''}
                        ${invoice.destination ? `<div>Destination: ${invoice.destination}</div>` : ''}
                    </div>
                </div>
            </div>

            <!-- Items Table -->
            <div class="mb-6 overflow-x-auto">
                <table class="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr class="bg-gray-100">
                            <th class="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">S.No.</th>
                            <th class="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Description</th>
                            <th class="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">HSN Code</th>
                            <th class="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Bale No.</th>
                            <th class="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Qty</th>
                            <th class="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Rate</th>
                            <th class="border border-gray-300 px-3 py-2 text-right text-sm font-semibold">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.items.map(item => `
                            <tr>
                                <td class="border border-gray-300 px-3 py-2 text-sm">${item.serialNumber}</td>
                                <td class="border border-gray-300 px-3 py-2 text-sm">${item.description}</td>
                                <td class="border border-gray-300 px-3 py-2 text-sm">${item.hsnCode}</td>
                                <td class="border border-gray-300 px-3 py-2 text-sm">${item.baleNumber || '-'}</td>
                                <td class="border border-gray-300 px-3 py-2 text-sm text-right">${item.quantity}</td>
                                <td class="border border-gray-300 px-3 py-2 text-sm text-right">₹${item.rate.toFixed(2)}</td>
                                <td class="border border-gray-300 px-3 py-2 text-sm text-right">₹${item.amount.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Totals Section -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 class="font-semibold text-gray-800 mb-2">Amount in words:</h3>
                    <div class="text-gray-600 p-3 bg-gray-100 rounded border min-h-16">
                        ${invoice.amountInWords} Rupees Only
                    </div>
                    
                    <!-- Bank Details -->
                    <div class="mt-4">
                        <h3 class="font-semibold text-gray-800 mb-2">Bank Details:</h3>
                        <div class="text-sm text-gray-600 space-y-1">
                            <div>Name of Bank: Union Bank of India</div>
                            <div>Account No.: 280611100001185</div>
                            <div>IFS Code: UBIN0557838</div>
                        </div>
                    </div>
                </div>
                
                <div>
                    <table class="w-full">
                        ${invoice.packingCharges > 0 ? `
                            <tr class="border-b">
                                <td class="py-2 text-right font-medium">Packing & Forwarding:</td>
                                <td class="py-2 text-right">₹${invoice.packingCharges.toFixed(2)}</td>
                            </tr>
                        ` : ''}
                        <tr class="border-b">
                            <td class="py-2 text-right font-medium">Total:</td>
                            <td class="py-2 text-right">₹${invoice.subtotal.toFixed(2)}</td>
                        </tr>
                        ${invoice.cgstAmount > 0 ? `
                            <tr class="border-b">
                                <td class="py-2 text-right font-medium">+CGST@ ${invoice.cgstRate}%:</td>
                                <td class="py-2 text-right">₹${invoice.cgstAmount.toFixed(2)}</td>
                            </tr>
                        ` : ''}
                        ${invoice.sgstAmount > 0 ? `
                            <tr class="border-b">
                                <td class="py-2 text-right font-medium">+SGST@ ${invoice.sgstRate}%:</td>
                                <td class="py-2 text-right">₹${invoice.sgstAmount.toFixed(2)}</td>
                            </tr>
                        ` : ''}
                        ${invoice.igstAmount > 0 ? `
                            <tr class="border-b">
                                <td class="py-2 text-right font-medium">+IGST@ ${invoice.igstRate}%:</td>
                                <td class="py-2 text-right">₹${invoice.igstAmount.toFixed(2)}</td>
                            </tr>
                        ` : ''}
                        ${Math.abs(invoice.roundOff) > 0.01 ? `
                            <tr class="border-b">
                                <td class="py-2 text-right font-medium">Round off:</td>
                                <td class="py-2 text-right">₹${invoice.roundOff.toFixed(2)}</td>
                            </tr>
                        ` : ''}
                        <tr class="border-t-2 border-purple-600">
                            <td class="py-3 text-right font-bold text-lg">Grand Total:</td>
                            <td class="py-3 text-right font-bold text-lg text-purple-600">₹${invoice.grandTotal.toFixed(2)}</td>
                        </tr>
                    </table>
                </div>
            </div>

            <!-- Signature -->
            <div class="mt-8 text-right">
                <div class="mb-16"></div>
                <div class="border-t border-gray-300 pt-2 inline-block">
                    <div class="font-semibold text-gray-800">Authorized Signature for Gauri Textile</div>
                </div>
            </div>
        </div>
    `;
    
    actionButtons.classList.remove('hidden');
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function printInvoice() {
    window.print();
}

function shareInvoice() {
    if (navigator.share && currentInvoice) {
        navigator.share({
            title: `Invoice ${currentInvoice.invoiceNumber}`,
            text: `Invoice for ${currentInvoice.customerName} - Amount: ₹${currentInvoice.grandTotal.toFixed(2)}`,
            url: window.location.href
        }).catch(console.error);
    } else if (currentInvoice) {
        const shareData = `Invoice ${currentInvoice.invoiceNumber}\nCustomer: ${currentInvoice.customerName}\nAmount: ₹${currentInvoice.grandTotal.toFixed(2)}`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareData);
            alert('Invoice details copied to clipboard!');
        }
    }
}

// Number to words conversion (Indian system)
function numberToWords(num) {
    if (num === 0) return 'Zero';
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    function convertHundreds(n) {
        let result = '';
        if (n >= 100) {
            result += ones[Math.floor(n / 100)] + ' Hundred ';
            n %= 100;
        }
        if (n >= 20) {
            result += tens[Math.floor(n / 10)] + ' ';
            n %= 10;
        }
        if (n > 0) {
            result += ones[n] + ' ';
        }
        return result;
    }
    
    if (num < 1000) {
        return convertHundreds(Math.floor(num)).trim();
    } else if (num < 100000) {
        const thousands = Math.floor(num / 1000);
        const remainder = num % 1000;
        let result = convertHundreds(thousands) + 'Thousand ';
        if (remainder > 0) {
            result += convertHundreds(remainder);
        }
        return result.trim();
    } else if (num < 10000000) {
        const lakhs = Math.floor(num / 100000);
        let remainder = num % 100000;
        let result = convertHundreds(lakhs) + 'Lakh ';
        if (remainder >= 1000) {
            const thousands = Math.floor(remainder / 1000);
            result += convertHundreds(thousands) + 'Thousand ';
            remainder = remainder % 1000;
        }
        if (remainder > 0) {
            result += convertHundreds(remainder);
        }
        return result.trim();
    } else {
        const crores = Math.floor(num / 10000000);
        let remainder = num % 10000000;
        let result = convertHundreds(crores) + 'Crore ';
        if (remainder >= 100000) {
            const lakhs = Math.floor(remainder / 100000);
            result += convertHundreds(lakhs) + 'Lakh ';
            remainder = remainder % 100000;
        }
        if (remainder >= 1000) {
            const thousands = Math.floor(remainder / 1000);
            result += convertHundreds(thousands) + 'Thousand ';
            remainder = remainder % 1000;
        }
        if (remainder > 0) {
            result += convertHundreds(remainder);
        }
        return result.trim();
    }
}