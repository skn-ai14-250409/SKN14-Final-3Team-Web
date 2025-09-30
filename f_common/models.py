from django.db import models

class UncBankLocation(models.Model):
    seq_id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=128)
    branch_code = models.CharField(max_length=64, unique=True)
    address = models.CharField(max_length=255)
    phone = models.CharField(max_length=64)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "unc_bank_location"

class UncEmploymentType(models.Model):
    seq_id = models.BigAutoField(primary_key=True)
    code = models.CharField(max_length=32, unique=True)
    name = models.CharField(max_length=64)
    description = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "unc_employment_type"

class CIndustryCode(models.Model):
    seq_id = models.BigAutoField(primary_key=True)
    code = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "c_industry_code"

class CEducationLevel(models.Model):
    class Education(models.TextChoices):
        High_School = "HIGH_SCHOOL", "고등학교 졸업"
        Associate = "ASSOCIATE", "전문학사"
        Bachelor = "BACHELOR", "학사"
        Master = "MASTER", "석사"
        Doctorate = "DOCTORATE", "박사"
    
    seq_id = models.BigAutoField(primary_key=True)
    code = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=64)
    description = models.CharField(max_length=255, null=True, blank=True)
    sort_order = models.PositiveSmallIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    class Meta:
        db_table = "c_education_level"

class CHousingStatus(models.Model):
    class Housing(models.TextChoices):
        Rent = "RENT", "월세/전세"
        Mortgage = "MORTGAGE", "자가(대출)"
        Own = "OWN", "자가"
        Other = "OTHER", "기타"
    

    seq_id = models.BigAutoField(primary_key=True)
    code = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=64)
    description = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "c_housing_status"
