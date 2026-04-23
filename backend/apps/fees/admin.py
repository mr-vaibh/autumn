from django.contrib import admin
from .models import FeeStructure, StudentFee, Payment, PromoCode


@admin.register(FeeStructure)
class FeeStructureAdmin(admin.ModelAdmin):
    list_display = ['name', 'academic_year', 'amount', 'frequency', 'is_active']
    list_filter = ['academic_year', 'frequency', 'is_active']
    search_fields = ['name']


@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount_percent', 'valid_from', 'valid_to', 'used_count', 'max_uses', 'is_active']
    list_filter = ['is_active']
    search_fields = ['code']


@admin.register(StudentFee)
class StudentFeeAdmin(admin.ModelAdmin):
    list_display = ['student', 'fee_structure', 'due_date', 'amount', 'status']
    list_filter = ['status', 'fee_structure']
    search_fields = ['student__name']
    ordering = ['-due_date']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['receipt_number', 'student_fee', 'amount', 'status', 'paid_at']
    list_filter = ['status']
    search_fields = ['receipt_number', 'razorpay_payment_id']
    readonly_fields = ['receipt_number', 'razorpay_order_id', 'razorpay_payment_id']
