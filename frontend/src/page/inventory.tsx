import SupplierManagement from '@/components/inventasris/SupplierManagement'
import { Component } from 'react'

export class inventory extends Component {
    render() {
        return (
            <div className="container">
                <div className="p-4 rounded-2xl flex justify-between">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Inventory Management</h1>
                    <div className="flex">
                        <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
                            Add New Supplier
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <SupplierManagement />
                    <SupplierManagement />
                    <SupplierManagement />
                    <SupplierManagement />
                </div>
            </div>
        )
    }
}

export default inventory