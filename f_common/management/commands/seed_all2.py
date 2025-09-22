import random
from django.core.management.base import BaseCommand
from faker import Faker
from django.utils import timezone

# Imports aligned to actual models
from f_user.models import User, UDepartment, UPosition
from f_loan.models import LoanAssessment, LoanProduct
from f_customer.models import Customer, CustomerPerson, CustomerCorporate
from f_common.models import (
    UncBankLocation,
    UncEmploymentType,
    CIndustryCode,
    CEducationLevel,
    CHousingStatus,
)
from f_document.models import Document, DocumentBinding
from f_chatbot.models import (
    UChatbotHistory,
    UChatbotSession,
    ChatbotRetrivalEvent,
    ChatbotRetrievedChunk,
)
from f_calendar.models import UCalendarEvent, UEventAttendees
from f_todo.models import UTodoList
from f_loan.models import LoanAssessment, LoanProduct


class Command(BaseCommand):
    help = "Seed all dummy data for development"

    def handle(self, *args, **kwargs):
        fake = Faker("ko_KR")

        # 1) f_user
        dept, _ = UDepartment.objects.get_or_create(
            code="SALES", defaults={"name": "Sales", "description": "Sales Department"}
        )
        pos, _ = UPosition.objects.get_or_create(
            code="MGR", defaults={"name": "Manager", "description": "Manager role"}
        )

        users = []
        for i in range(10):
            user, _ = User.objects.get_or_create(
                employee_id=f"KB25{i:04d}",
                defaults={
                    "email": f"user{i}@example.com",
                    "password": "test1234",
                    "name": fake.name(),
                    "position": pos,
                    "department": dept,
                    "manager": None,
                    "bank_location": None,
                    "hire_date": fake.date_between(start_date="-5y", end_date="today"),
                    "mobile": fake.phone_number(),
                    "birthdate": fake.date_of_birth(minimum_age=20, maximum_age=60),
                    "employment_status": User.EmploymentStatus.ON_DUTY,
                    "employment_type": None,
                    "is_active": True,
                },
            )
            users.append(user)

        # 2) f_common
        bank, _ = UncBankLocation.objects.get_or_create(
            branch_code="SEOUL001",
            defaults={
                "name": "Seoul Central Branch",
                "address": "Seoul, Korea",
                "phone": "02-000-0000",
            },
        )
        emp_type, _ = UncEmploymentType.objects.get_or_create(
            code="FT",
            defaults={"name": "Full-time", "description": "Full-time position"},
        )

        edu, _ = CEducationLevel.objects.get_or_create(
            code="UNI",
            defaults={"name": "University", "description": "4-year degree"},
        )
        house, _ = CHousingStatus.objects.get_or_create(
            code="OWNED",
            defaults={"name": "Owned", "description": "Home owned"},
        )
        industry, _ = CIndustryCode.objects.get_or_create(
            code="IT01", defaults={"name": "IT Industry"}
        )

        # 3) f_customer
        customers = []
        for i in range(10):
            customer, _ = Customer.objects.get_or_create(
                display_name=f"Individual Customer {i+1}",
                customer_type=Customer.CustomerType.INDIVIDUAL,
                defaults={
                    "bank_location": bank,
                    "status": "ACTIVE",
                    "risk_segment": "RETAIL",
                },
            )
            customers.append(customer)
            CustomerPerson.objects.get_or_create(
                customer=customer,
                defaults={
                    "first_name": fake.last_name(),
                    "last_name": fake.first_name(),
                    "gender": random.choice([0, 1]),
                    "rrn": f"{i+1:010d}{random.randint(0,9)}",
                    "mobile": f"010{random.randint(10000000,99999999)}",
                    "email": f"person{i}@example.com",
                    "account_number": f"110-{random.randint(1000,9999)}-{random.randint(100000,999999)}",
                    "account_amount": fake.pydecimal(left_digits=7, right_digits=2),
                    "education_level": edu,
                    "housing_status": house,
                    "income_annual": fake.pydecimal(left_digits=6, right_digits=0),
                    "work_experience_years": random.randint(0, 20),
                    "employment_type": emp_type,
                    "industry_code": industry,
                    "has_delinquency": random.choice([False, True]),
                    "credit_history_length": random.randint(0, 20),
                    "credit_rating": random.randint(1, 10),
                },
            )

        corp_customers = []
        for i in range(5):
            corp_customer, _ = Customer.objects.get_or_create(
                display_name=f"Corporate Customer {i+1}",
                customer_type=Customer.CustomerType.CORPORATE,
                defaults={
                    "bank_location": bank,
                    "status": "ACTIVE",
                    "risk_segment": "SME",
                },
            )
            corp_customers.append(corp_customer)
            CustomerCorporate.objects.get_or_create(
                customer=corp_customer,
                defaults={
                    "industry_code": industry,
                    "legal_name": f"Test Corp {i+1}",
                    "biz_reg_no_masked": f"{random.randint(1000000000, 9999999999)}",
                    "incorporation_date": fake.date_between(start_date="-30y", end_date="today"),
                    "employees_count": fake.random_int(min=10, max=500),
                    "mobile": "010-0000-0000",
                    "current_assets": None,
                },
            )

        # 4) f_loan
        LoanProduct.objects.get_or_create(
            name="Standard Credit Loan",
            defaults={
                "product_type": "CREDIT_LOAN",
                "min_rate_bp": 300,
                "max_rate_bp": 900,
                "min_limit_krw": 1_000_000,
                "max_limit_krw": 50_000_000,
                "max_term_months": 60,
                "is_active": True,
            },
        )

        all_customers = customers + corp_customers
        for i in range(10):
            # LoanAssessment에 정의된 choices 중 하나의 값(코드)을 무작위로 선택
            purpose_value = random.choice([c[0] for c in LoanAssessment.LoanPurpose.choices])

            LoanAssessment.objects.get_or_create(
                customer=random.choice(all_customers),
                defaults={
                    "customer_type": random.choice(["INDIVIDUAL", "CORPORATE"]),
                    "product_type": random.choice([
                        "CREDIT_LOAN", "MORTGAGE_LOAN", "CAR_LOAN", "HOUSING_LOAN", "BUSINESS_LOAN",
                    ]),
                    "requested_amount": fake.pydecimal(left_digits=7, right_digits=2),
                    "requested_term": random.randint(6, 60),
                    "purpose": purpose_value,   # <-- 변경된 부분
                    "created_by": random.choice(users),
                    "approval": random.choice([0, 1, 2]),
                },
            )


        # 5) f_document
        for i in range(5):
            doc, _ = Document.objects.get_or_create(
                file_name=f"report{i+1}.pdf",
                defaults={
                    "title": f"Document {i+1}",
                    "storage_path": f"/docs/report{i+1}.pdf",
                    "created_by": random.choice(users),
                },
            )
            DocumentBinding.objects.get_or_create(
                document=doc,
                defaults={
                    "bind_type": random.choice(["CHAT", "REVIEW"]),
                    "bind_id": random.randint(100, 200),
                },
            )

        # 6) f_chatbot
        history, _ = UChatbotHistory.objects.get_or_create(
            user=users[0], defaults={"title": "Test Conversation"}
        )
        UChatbotSession.objects.get_or_create(
            chatbot_history=history,
            content_from="USER",
            defaults={
                "content": "Hello, I'd like to know my loan limit.",
                "sent_at": timezone.now(),
            },
        )
        ai_msg, _ = UChatbotSession.objects.get_or_create(
            chatbot_history=history,
            content_from="AI",
            defaults={
                "content": "It depends on your credit profile.",
                "sent_at": timezone.now(),
            },
        )
        event, _ = ChatbotRetrivalEvent.objects.get_or_create(
            session_msg=ai_msg,
            defaults={
                "retriever": "BM25",
                "query_text": "loan limit",
                "k": 5,
                "score_type": "cosine",
                "latency_ms": random.randint(10, 100),
            },
        )
        ChatbotRetrievedChunk.objects.get_or_create(
            retriever=event,
            rank=1,
            defaults={
                "doc_id": "doc-1",
                "chunk_id": "chunk-1",
                "score": 0.87,
                "used_in_context": True,
            },
        )

        # 7) f_calendar
        start = timezone.now()
        end = start + timezone.timedelta(hours=1)
        cal_event, _ = UCalendarEvent.objects.get_or_create(
            title="Team Meeting",
            user=users[0],
            defaults={
                "organizer": users[0],
                "content": "Weekly sync",
                "start_at": start,
                "end_at": end,
                "status": "CONFIRMED",
                "visibility": "PUBLIC",
            },
        )
        UEventAttendees.objects.get_or_create(
            event=cal_event,
            attendee_user=users[0],
            defaults={
                "response_status": "ACCEPTED",
                "is_optional": False,
            },
        )

        # 8) f_todo
        UTodoList.objects.get_or_create(
            user=users[0],
            title="Todo 1",
            defaults={
                "content": fake.sentence(),
                "is_done": False,
            },
        )

        self.stdout.write(self.style.SUCCESS("All dummy data seeded!"))
